const fs = require('fs');

let seedStr = fs.readFileSync('prisma/seed.ts', 'utf8');

// Replace aliases: ['...'] with searchTags: '...'
seedStr = seedStr.replace(/aliases:\s*\[([^\]]+)\]/g, (match, p1) => {
  const cleanTags = p1.replace(/['"]/g, '').split(',').map(s => s.trim()).join(' ');
  return `searchTags: '${cleanTags}'`;
});

// If the parser is already appended, don't append it again
if (!seedStr.includes('parseMarkdown')) {
  // Remove the closing tags from the main block so we can append our logic
  seedStr = seedStr.replace(/  console\.log\('Database seeding completed successfully!'\);\n}/, '');

  const appendedCode = `
  // --- DYNAMIC MARKDOWN PARSER ---
  console.log('Parsing Markdown for remaining colleges...');
  const fs = require('fs');
  const path = require('path');
  const mdPath = path.resolve(__dirname, '../../Engineering Institute Data Compilation.md');
  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  const parseTable = (regex) => {
    const match = mdContent.match(regex);
    if (!match) return [];
    const lines = match[1].trim().split('\\n').slice(2);
    return lines.map(line => line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1));
  };

  const iitRows = parseTable(/\\| Institution \\(IIT\\) \\|.*?\\n\\|.*?\\n([\\s\\S]*?)\\n\\n/);
  const nitRows = parseTable(/\\| Institute \\(NIT\\) \\|.*?\\n\\|.*?\\n([\\s\\S]*?)\\n\\n/);

  const existingColleges = await prisma.college.findMany();
  const existingNames = existingColleges.map(c => c.name.toLowerCase());
  const existingSlugs = existingColleges.map(c => c.slug);

  const cleanVal = (str) => {
    str = str.replace(/~/, '').trim();
    if (str.includes('-')) {
      const parts = str.split('-');
      return parseInt(parts[1].trim());
    }
    return parseInt(str);
  };

  const getOpening = (str) => {
    str = str.replace(/~/, '').trim();
    if (str.includes('-')) {
      return parseInt(str.split('-')[0].trim());
    }
    return null;
  };

  // Insert IITs
  for (const row of iitRows) {
    const nameStr = row[0].replace(/\\*\\*/g, '').trim(); // e.g. "IIT Roorkee"
    const fullName = nameStr.replace('IIT ', 'Indian Institute of Technology ');
    
    // Check if already exists
    if (existingNames.includes(fullName.toLowerCase()) || existingNames.some(en => en.includes(nameStr.toLowerCase()))) {
      continue;
    }

    console.log('Adding ' + fullName);
    const closingRank = cleanVal(row[1]);
    const openingRank = getOpening(row[1]);

    if (isNaN(closingRank)) continue;

    await prisma.college.create({
      data: {
        name: fullName,
        slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        searchTags: nameStr,
        institutionType: 'Public',
        logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80',
        rating: 4.2,
        description: fullName + ' is a premier engineering institute in India.',
        fees: 200000,
        intake: 1000,
        avgPackage: parseFloat(row[6].replace(/[^0-9.]/g, '')) || 15.0,
        highestPackage: 50.0,
        topRecruiters: ['Amazon', 'Google', 'Microsoft'],
        exams: { connect: [{ id: jeeAdvanced.id }] },
        courses: { create: [{ name: 'Computer Science and Engineering', fees: 200000, duration: 4 }] },
        cutoffs: {
          create: [
            { 
              examId: jeeAdvanced.id, 
              cutoffValue: closingRank, 
              criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', ...(openingRank ? { openingRank } : {}) } 
            }
          ]
        }
      }
    });
  }

  // Insert NITs
  for (const row of nitRows) {
    const nameStr = row[0].replace(/\\*\\*/g, '').trim();
    const fullName = nameStr.replace('NIT ', 'National Institute of Technology ');
    
    if (existingNames.includes(fullName.toLowerCase()) || existingNames.some(en => en.includes(nameStr.toLowerCase()))) {
      continue;
    }

    console.log('Adding ' + fullName);
    const osClosing = cleanVal(row[1]);
    const osOpening = getOpening(row[1]);
    const hsClosing = cleanVal(row[2]);
    const hsOpening = getOpening(row[2]);

    if (isNaN(osClosing)) continue;

    await prisma.college.create({
      data: {
        name: fullName,
        slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        searchTags: nameStr,
        institutionType: 'Public',
        logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop&q=80',
        rating: 4.0,
        description: fullName + ' is one of the premier National Institutes of Technology.',
        fees: 150000,
        intake: 900,
        avgPackage: parseFloat(row[5].replace(/[^0-9.]/g, '')) || 12.0,
        highestPackage: 40.0,
        topRecruiters: ['Amazon', 'Oracle', 'Cisco'],
        exams: { connect: [{ id: jeeMain.id }] },
        courses: { create: [{ name: 'Computer Science and Engineering', fees: 150000, duration: 4 }] },
        cutoffs: {
          create: [
            { 
              examId: jeeMain.id, 
              cutoffValue: osClosing, 
              criteria: { category: 'OPEN', state: 'Other State', branch: 'Computer Science and Engineering', ...(osOpening ? { openingRank: osOpening } : {}) } 
            },
            ...(isNaN(hsClosing) ? [] : [{ 
              examId: jeeMain.id, 
              cutoffValue: hsClosing, 
              criteria: { category: 'OPEN', state: 'Home State', branch: 'Computer Science and Engineering', ...(hsOpening ? { openingRank: hsOpening } : {}) } 
            }])
          ]
        }
      }
    });
  }

  console.log('Database seeding completed successfully!');
}
`;
  seedStr += appendedCode;
}

fs.writeFileSync('prisma/seed.ts', seedStr);
console.log('seed.ts updated!');
