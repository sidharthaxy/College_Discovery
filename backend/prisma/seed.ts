import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old database entries...');
  await prisma.review.deleteMany({});
  await prisma.cutoff.deleteMany({});
  await prisma.placement.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.college.deleteMany({});
  await prisma.exam.deleteMany({});

  console.log('Creating users...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@collegediscovery.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isVerifiedStudent: false,
      verificationStatus: 'VERIFIED'
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: 'student@example.com',
      passwordHash: userPassword,
      role: 'USER',
      isVerifiedStudent: true,
      verificationStatus: 'VERIFIED'
    }
  });

  console.log('Creating exams...');
  const jeeAdvanced = await prisma.exam.create({
    data: {
      name: 'JEE Advanced',
      formSchema: [
        { name: 'category', label: 'Category', type: 'select', options: ['OPEN', 'OBC-NCL', 'SC', 'ST'] }
      ]
    }
  });

  const jeeMain = await prisma.exam.create({
    data: {
      name: 'JEE Main',
      formSchema: [
        { name: 'category', label: 'Category', type: 'select', options: ['OPEN', 'OBC-NCL', 'SC', 'ST'] },
        { name: 'state', label: 'State Quota', type: 'select', options: ['Home State', 'Other State'] }
      ]
    }
  });

  const bitsat = await prisma.exam.create({
    data: {
      name: 'BITSAT',
      scoringType: 'SCORE',
      formSchema: []
    }
  });

  console.log('Creating colleges...');
  
  // 1. IIT Bombay
  const iitb = await prisma.college.create({
    data: {
      name: 'Indian Institute of Technology Bombay',
      slug: 'iit-bombay',
      searchTags: 'IITB IIT Bombay',
      institutionType: 'Public',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80',
      rating: 4.8,
      location: 'Mumbai, Maharashtra',
      description: 'Established in 1958, IIT Bombay is recognized worldwide as a leader in the field of engineering education and research. It is known for its sprawling campus and vibrant student life.',
      fees: 220000,
      intake: 1200,
      avgPackage: 23.50,
      highestPackage: 367.00,
      topRecruiters: ['Microsoft', 'Google', 'Optiver', 'Jane Street', 'Rubrik'],
      exams: { connect: [{ id: jeeAdvanced.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 220000, duration: 4 },
          { name: 'Electrical Engineering', fees: 220000, duration: 4 },
          { name: 'Mechanical Engineering', fees: 220000, duration: 4 },
          { name: 'Aerospace Engineering', fees: 220000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 21.8, highestPackage: 200.0 },
          { year: 2023, avgPackage: 22.7, highestPackage: 367.0 },
          { year: 2024, avgPackage: 23.5, highestPackage: 150.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeAdvanced.id, cutoffValue: 66, criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeAdvanced.id, cutoffValue: 35, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeAdvanced.id, cutoffValue: 280, criteria: { category: 'OPEN', branch: 'Electrical Engineering', round: 6 } },
        ]
      },
      reviews: {
        create: [
          { userId: student.id, rating: 5, comment: 'Best engineering college in India. The tech culture is unmatched.', isVerified: true, status: 'APPROVED' },
          { userId: student.id, rating: 4, comment: 'Academics are tough, but hostel life is very fun. Mood Indigo is huge!', isVerified: true, status: 'APPROVED' }
        ]
      }
    }
  });

  // 2. IIT Delhi
  const iitd = await prisma.college.create({
    data: {
      name: 'Indian Institute of Technology Delhi',
      slug: 'iit-delhi',
      searchTags: 'IITD IIT Delhi',
      institutionType: 'Public',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      rating: 4.7,
      location: 'New Delhi, Delhi',
      description: 'Located in the heart of the national capital, IIT Delhi offers excellent infrastructure and is famous for its entrepreneurial culture and alumni network.',
      fees: 225000,
      intake: 1050,
      avgPackage: 22.00,
      highestPackage: 250.00,
      topRecruiters: ['Tower Research', 'Graviton', 'Google', 'Microsoft', 'Bain & Co'],
      exams: { connect: [{ id: jeeAdvanced.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 225000, duration: 4 },
          { name: 'Mathematics and Computing', fees: 225000, duration: 4 },
          { name: 'Electrical Engineering', fees: 225000, duration: 4 },
          { name: 'Mechanical Engineering', fees: 225000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 20.5, highestPackage: 200.0 },
          { year: 2023, avgPackage: 21.5, highestPackage: 250.0 },
          { year: 2024, avgPackage: 22.0, highestPackage: 210.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeAdvanced.id, cutoffValue: 102, criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeAdvanced.id, cutoffValue: 80, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeAdvanced.id, cutoffValue: 300, criteria: { category: 'OPEN', branch: 'Mathematics and Computing', round: 6 } },
        ]
      },
      reviews: {
        create: [
          { userId: student.id, rating: 5, comment: 'Startup culture is crazy here! So many successful founders.', isVerified: true, status: 'APPROVED' }
        ]
      }
    }
  });

  // 3. IIT Madras
  const iitm = await prisma.college.create({
    data: {
      name: 'Indian Institute of Technology Madras',
      slug: 'iit-madras',
      searchTags: 'IITM IIT Madras',
      institutionType: 'Public',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80',
      rating: 4.8,
      location: 'Chennai, Tamil Nadu',
      description: 'Ranked No. 1 in NIRF Engineering category consecutively, IIT Madras is celebrated for its highly successful research park, lush green forest campus, and academic brilliance.',
      fees: 215000,
      intake: 1100,
      avgPackage: 22.00,
      highestPackage: 48.00,
      topRecruiters: ['Google', 'Microsoft', 'Rubrik', 'Citadel', 'J.P. Morgan'],
      exams: { connect: [{ id: jeeAdvanced.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 215000, duration: 4 },
          { name: 'Electrical Engineering', fees: 215000, duration: 4 },
          { name: 'Aerospace Engineering', fees: 215000, duration: 4 },
          { name: 'Civil Engineering', fees: 215000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 19.8, highestPackage: 44.0 },
          { year: 2023, avgPackage: 20.9, highestPackage: 46.0 },
          { year: 2024, avgPackage: 22.0, highestPackage: 48.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeAdvanced.id, cutoffValue: 85, criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeAdvanced.id, cutoffValue: 52, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeAdvanced.id, cutoffValue: 360, criteria: { category: 'OPEN', branch: 'Electrical Engineering', round: 6 } },
        ]
      },
      reviews: {
        create: [
          { userId: student.id, rating: 5, comment: 'The ecosystem here is great. The IITM Research Park provides endless startup opportunities.', isVerified: true, status: 'APPROVED' }
        ]
      }
    }
  });

  // 4. NIT Trichy
  const nitt = await prisma.college.create({
    data: {
      name: 'National Institute of Technology Tiruchirappalli',
      slug: 'nit-trichy',
      searchTags: 'NITT NIT Trichy NIT Tiruchirappalli',
      institutionType: 'Public',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop&q=80',
      rating: 4.5,
      location: 'Tiruchirappalli, Tamil Nadu',
      description: 'NIT Trichy is consistently rated as the top National Institute of Technology in India, boasting superior placement percentages and a beautiful, sprawling campus in central Tamil Nadu.',
      fees: 145000,
      intake: 1000,
      avgPackage: 15.00,
      highestPackage: 32.00,
      topRecruiters: ['Amazon', 'Oracle', 'Cisco', 'De Shaw', 'Samsung'],
      exams: { connect: [{ id: jeeMain.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 145000, duration: 4 },
          { name: 'Electronics and Communication Engineering', fees: 145000, duration: 4 },
          { name: 'Mechanical Engineering', fees: 145000, duration: 4 },
          { name: 'Civil Engineering', fees: 145000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 13.5, highestPackage: 28.0 },
          { year: 2023, avgPackage: 14.8, highestPackage: 30.0 },
          { year: 2024, avgPackage: 15.0, highestPackage: 32.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeMain.id, cutoffValue: 1500, criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeMain.id, cutoffValue: 550, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeMain.id, cutoffValue: 320, criteria: { category: 'SC', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeMain.id, cutoffValue: 3200, criteria: { category: 'OPEN', branch: 'Electronics and Communication Engineering', round: 6 } },
        ]
      },
      reviews: {
        create: [
          { userId: student.id, rating: 4, comment: 'Arguably the best NIT. The student club culture is very rich, and we get top recruiters similar to mid-level IITs.', isVerified: true, status: 'APPROVED' },
          { userId: student.id, rating: 4, comment: 'Placements are excellent, though climate is extremely hot during summers. Pragyan is an amazing symposium!', isVerified: true, status: 'APPROVED' },
          { userId: admin.id, rating: 5, comment: 'The coding culture here is outstanding. Labs are open 24/7.', isVerified: false, status: 'PENDING' }
        ]
      }
    }
  });

  // 5. NIT Surathkal
  const nits = await prisma.college.create({
    data: {
      name: 'National Institute of Technology Karnataka, Surathkal',
      slug: 'nit-surathkal',
      searchTags: 'NITK NIT Surathkal',
      institutionType: 'Public',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1607237138185-eedd996c5c0c?w=1200&h=400&fit=crop&q=80',
      rating: 4.4,
      location: 'Mangaluru, Karnataka',
      description: 'Known for its unique campus with a private beach, NIT Surathkal is a stellar institution offering top-tier academics, state-of-the-art labs, and remarkable placements.',
      fees: 150000,
      intake: 950,
      avgPackage: 14.50,
      highestPackage: 30.00,
      topRecruiters: ['Microsoft', 'Uber', 'Goldman Sachs', 'Wells Fargo', 'Adobe'],
      exams: { connect: [{ id: jeeMain.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 150000, duration: 4 },
          { name: 'Information Technology', fees: 150000, duration: 4 },
          { name: 'Electrical and Electronics Engineering', fees: 150000, duration: 4 },
          { name: 'Mechanical Engineering', fees: 150000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 12.8, highestPackage: 26.0 },
          { year: 2023, avgPackage: 13.9, highestPackage: 28.0 },
          { year: 2024, avgPackage: 14.5, highestPackage: 30.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeMain.id, cutoffValue: 1684, criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeMain.id, cutoffValue: 620, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeMain.id, cutoffValue: 2800, criteria: { category: 'OPEN', branch: 'Information Technology', round: 6 } },
        ]
      },
      reviews: {
        create: [
          { userId: student.id, rating: 5, comment: 'Having a beach right on campus is just incredible. Placements are solid as well.', isVerified: true, status: 'APPROVED' }
        ]
      }
    }
  });

  // 6. NIT Rourkela
  const nitr = await prisma.college.create({
    data: {
      name: 'National Institute of Technology Rourkela',
      slug: 'nit-rourkela',
      searchTags: 'NITR NIT Rourkela',
      institutionType: 'Public',
      location: 'Rourkela, Odisha',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
      rating: 4.3,
      description: 'One of the largest campuses among NITs, NIT Rourkela is known for its excellent research outputs, high placement rates, and diverse student groups.',
      fees: 140000,
      intake: 1100,
      avgPackage: 13.50,
      highestPackage: 28.00,
      topRecruiters: ['Tata Steel', 'Qualcomm', 'Deloitte', 'Capgemini', 'Wipro'],
      exams: { connect: [{ id: jeeMain.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 140000, duration: 4 },
          { name: 'Electronics and Instrumentation Engineering', fees: 140000, duration: 4 },
          { name: 'Mechanical Engineering', fees: 140000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 12.0, highestPackage: 24.0 },
          { year: 2023, avgPackage: 12.8, highestPackage: 26.0 },
          { year: 2024, avgPackage: 13.5, highestPackage: 28.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeMain.id, cutoffValue: 3200, criteria: { category: 'OPEN', branch: 'Computer Science and Engineering', round: 6 } },
          { examId: jeeMain.id, cutoffValue: 1200, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6 } },
        ]
      },
      reviews: {
        create: [
          { userId: admin.id, rating: 4, comment: 'Great research culture and a sprawling campus.', isVerified: false, status: 'APPROVED' }
        ]
      }
    }
  });

  // 7. BITS Pilani
  const bitsp = await prisma.college.create({
    data: {
      name: 'Birla Institute of Technology and Science, Pilani',
      slug: 'bits-pilani',
      searchTags: 'BITS BITS Pilani',
      institutionType: 'Private',
      location: 'Pilani, Rajasthan',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80',
      rating: 4.8,
      description: 'BITS Pilani is one of India’s leading higher education institutes and a deemed university. It is known for its rigorous academic curriculum and zero-attendance policy.',
      fees: 260000,
      intake: 1040,
      avgPackage: 20.00,
      highestPackage: 120.00,
      topRecruiters: ['Qualcomm', 'Intel', 'Microsoft', 'Google', 'Amazon'],
      exams: { connect: [{ id: bitsat.id }] },
      courses: {
        create: [
          { name: 'Computer Science', fees: 260000, duration: 4 },
          { name: 'Electronics and Communication', fees: 260000, duration: 4 },
          { name: 'Electrical and Electronics', fees: 260000, duration: 4 },
          { name: 'Mechanical', fees: 260000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2022, avgPackage: 18.5, highestPackage: 60.0 },
          { year: 2023, avgPackage: 19.4, highestPackage: 100.0 },
          { year: 2024, avgPackage: 20.0, highestPackage: 120.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: bitsat.id, cutoffValue: 210, criteria: { branch: 'B.E. Chemical' } },
          { examId: bitsat.id, cutoffValue: 206, criteria: { branch: 'B.E. Civil' } },
          { examId: bitsat.id, cutoffValue: 260, criteria: { branch: 'B.E. Electrical & Electronics' } },
          { examId: bitsat.id, cutoffValue: 235, criteria: { branch: 'B.E. Mechanical' } },
          { examId: bitsat.id, cutoffValue: 304, criteria: { branch: 'B.E. Computer Science' } },
          { examId: bitsat.id, cutoffValue: 250, criteria: { branch: 'B.E. Electronics & Instrumentation' } },
          { examId: bitsat.id, cutoffValue: 285, criteria: { branch: 'B.E. Electronics & Communication' } },
          { examId: bitsat.id, cutoffValue: 211, criteria: { branch: 'B.E. Manufacturing' } },
          { examId: bitsat.id, cutoffValue: 295, criteria: { branch: 'B.E. Mathematics and Computing' } },
          { examId: bitsat.id, cutoffValue: 203, criteria: { branch: 'B.E. Environmental and Sustainability' } },
          { examId: bitsat.id, cutoffValue: 168, criteria: { branch: 'B. Pharm' } },
          { examId: bitsat.id, cutoffValue: 208, criteria: { branch: 'M.Sc. Biological Sciences' } },
          { examId: bitsat.id, cutoffValue: 212, criteria: { branch: 'M.Sc. Chemistry' } },
          { examId: bitsat.id, cutoffValue: 251, criteria: { branch: 'M.Sc. Economics' } },
          { examId: bitsat.id, cutoffValue: 229, criteria: { branch: 'M.Sc. Mathematics' } },
          { examId: bitsat.id, cutoffValue: 223, criteria: { branch: 'M.Sc. Physics' } },
          { examId: bitsat.id, cutoffValue: 239, criteria: { branch: 'M.Sc. Semiconductor and Nanoscience' } }
        ]
      },
      reviews: {
        create: [
          { userId: student.id, rating: 5, comment: 'Amazing peer group and the zero attendance policy is a huge plus for those doing side projects.', isVerified: true, status: 'APPROVED' }
        ]
      }
    }
  });

  // 8. IIT Kanpur (New Data)
  const iitk = await prisma.college.create({
    data: {
      name: 'Indian Institute of Technology Kanpur',
      slug: 'iit-kanpur',
      searchTags: 'IITK IIT Kanpur',
      institutionType: 'Public',
      location: 'Kanpur, Uttar Pradesh',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80',
      rating: 4.7,
      description: 'IIT Kanpur is renowned for its academic rigor, immense research focus, and beautiful campus.',
      fees: 215000,
      intake: 1200,
      avgPackage: 26.27,
      highestPackage: 190.0,
      topRecruiters: ['Tower Research', 'Google', 'Microsoft', 'Jane Street'],
      exams: { connect: [{ id: jeeAdvanced.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 215000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2024, avgPackage: 26.27, highestPackage: 190.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeAdvanced.id, cutoffValue: 271, criteria: { openingRank: 270, category: 'OPEN', branch: 'Computer Science and Engineering' } },
          { examId: jeeAdvanced.id, cutoffValue: 130, criteria: { category: 'OBC-NCL', branch: 'Computer Science and Engineering' } },
        ]
      }
    }
  });

  // 9. NIT Calicut (New Data)
  const nitc = await prisma.college.create({
    data: {
      name: 'National Institute of Technology Calicut',
      slug: 'nit-calicut',
      searchTags: 'NITC NIT Calicut',
      institutionType: 'Public',
      location: 'Kozhikode, Kerala',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop&q=80',
      rating: 4.4,
      description: 'NIT Calicut is one of the top National Institutes of Technology in India.',
      fees: 150000,
      intake: 1100,
      avgPackage: 17.30,
      highestPackage: 51.0,
      topRecruiters: ['Amazon', 'Oracle', 'Cisco'],
      exams: { connect: [{ id: jeeMain.id }] },
      courses: {
        create: [
          { name: 'Computer Science and Engineering', fees: 150000, duration: 4 },
        ]
      },
      placements: {
        create: [
          { year: 2024, avgPackage: 17.30, highestPackage: 51.0 },
        ]
      },
      cutoffs: {
        create: [
          { examId: jeeMain.id, cutoffValue: 5222, criteria: { openingRank: 4482, category: 'OPEN', state: 'Other State', branch: 'Computer Science and Engineering' } },
          { examId: jeeMain.id, cutoffValue: 9271, criteria: { openingRank: 7971, category: 'OPEN', state: 'Home State', branch: 'Computer Science and Engineering' } },
          { examId: jeeMain.id, cutoffValue: 1457, criteria: { category: 'OBC-NCL', state: 'Other State', branch: 'Computer Science and Engineering' } },
        ]
      }
    }
  });



  // --- DYNAMIC MARKDOWN PARSER ---
  console.log('Parsing Markdown for remaining colleges...');
  const fs = require('fs');
  const path = require('path');
  const mdPath = path.resolve(__dirname, '../../Engineering Institute Data Compilation.md');
  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  const parseTable = (regex: RegExp) => {
    const match = mdContent.match(regex);
    if (!match) return [];
    const lines = match[1].trim().split('\n');
    return lines.map((line: string) => line.split('|').map((c: string) => c.trim()).filter((_: any, i: number, arr: any[]) => i > 0 && i < arr.length - 1));
  };

  const iitRows = parseTable(/\| Institution \(IIT\) \|.*?\n\|.*?\n([\s\S]*?)\n\n/);
  const nitRows = parseTable(/\| Institute \(NIT\) \|.*?\n\|.*?\n([\s\S]*?)\n\n/);

  const existingColleges = await prisma.college.findMany();
  const existingNames = existingColleges.map(c => c.name.toLowerCase());

  const cleanVal = (str: string) => {
    str = str.replace(/~/, '').trim();
    if (str.includes('-')) {
      const parts = str.split('-');
      return parseInt(parts[1].replace(/[^0-9]/g, ''));
    }
    return parseInt(str.replace(/[^0-9]/g, ''));
  };

  const getOpening = (str: string) => {
    str = str.replace(/~/, '').trim();
    if (str.includes('-')) {
      return parseInt(str.split('-')[0].replace(/[^0-9]/g, ''));
    }
    return null;
  };

  // Insert IITs
  for (const row of iitRows) {
    if (row.length < 2) continue;
    const nameStr = row[0].replace(/\*\*/g, '').trim(); // e.g. "IIT Roorkee"
    const fullName = nameStr.replace('IIT ', 'Indian Institute of Technology ');
    
    // Check if already exists
    if (existingNames.includes(fullName.toLowerCase()) || existingNames.some(en => en.includes(nameStr.toLowerCase()))) {
      continue;
    }

    const closingRank = cleanVal(row[1]);
    const openingRank = getOpening(row[1]);

    if (isNaN(closingRank)) continue;
    console.log('Adding ' + fullName);

    await prisma.college.create({
      data: {
        name: fullName,
        slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        searchTags: nameStr,
        institutionType: 'Public',
        location: 'India',
        logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80',
        rating: 4.2,
        description: fullName + ' is a premier engineering institute in India.',
        fees: 200000,
        intake: 1000,
        avgPackage: parseFloat((row[6] || '').replace(/[^0-9.]/g, '')) || 15.0,
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
    if (row.length < 3) continue;
    const nameStr = row[0].replace(/\*\*/g, '').trim();
    const fullName = nameStr.replace('NIT ', 'National Institute of Technology ');
    
    if (existingNames.includes(fullName.toLowerCase()) || existingNames.some(en => en.includes(nameStr.toLowerCase()))) {
      continue;
    }

    const osClosing = cleanVal(row[1]);
    const osOpening = getOpening(row[1]);
    const hsClosing = cleanVal(row[2]);
    const hsOpening = getOpening(row[2]);

    if (isNaN(osClosing)) continue;
    console.log('Adding ' + fullName);

    await prisma.college.create({
      data: {
        name: fullName,
        slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        searchTags: nameStr,
        institutionType: 'Public',
        location: 'India',
        logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=1200&h=400&fit=crop&q=80',
        rating: 4.0,
        description: fullName + ' is one of the premier National Institutes of Technology.',
        fees: 150000,
        intake: 900,
        avgPackage: parseFloat((row[5] || '').replace(/[^0-9.]/g, '')) || 12.0,
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
