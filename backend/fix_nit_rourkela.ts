import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 
  'Lakshadweep', 'Puducherry'
];

async function main() {
  // 1. Update JEE Main Form Schema
  const jeeMain = await prisma.exam.findFirst({
    where: { name: { contains: 'JEE Main' } }
  });

  if (jeeMain) {
    const updatedSchema = [
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS']
      },
      {
        name: 'state',
        label: 'Home State',
        type: 'select',
        options: INDIAN_STATES
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Other']
      }
    ];

    await prisma.exam.update({
      where: { id: jeeMain.id },
      data: { formSchema: updatedSchema }
    });
    console.log('Updated JEE Main form schema.');
  }

  // 2. Update NIT Rourkela
  const nitRkl = await prisma.college.findFirst({
    where: { name: { contains: 'Rourkela' } }
  });

  if (nitRkl) {
    // Ensure location has Odisha so HS matching works
    const newLocation = nitRkl.location.includes('Odisha') ? nitRkl.location : 'Rourkela, Odisha';

    await prisma.college.update({
      where: { id: nitRkl.id },
      data: {
        coverUrl: 'https://www.nitrkl.ac.in/assets/images/gallery3.webp',
        location: newLocation
      }
    });
    console.log('Updated NIT Rourkela details.');

    // Delete existing cutoffs for NIT Rourkela
    await prisma.cutoff.deleteMany({
      where: { collegeId: nitRkl.id, examId: jeeMain?.id }
    });
    console.log('Deleted old cutoffs for NIT Rourkela.');

    // Insert new cutoffs
    if (jeeMain) {
      const cutoffsData = [
        { branch: 'Computer Science & Engineering', hs: 7800, os: 3700 },
        { branch: 'Artificial Intelligence', hs: 18000, os: 4500 },
        { branch: 'Electronics & Comm. Eng', hs: 11000, os: 6700 },
        { branch: 'Electrical Engineering', hs: 12900, os: 10600 },
        { branch: 'Mechanical Engineering', hs: 15000, os: 15300 },
        { branch: 'Civil Engineering', hs: 27900, os: 25000 }
      ];

      for (const c of cutoffsData) {
        // HS cutoff
        await prisma.cutoff.create({
          data: {
            collegeId: nitRkl.id,
            examId: jeeMain.id,
            cutoffValue: c.hs,
            criteria: { category: 'OPEN', state: 'Home State', branch: c.branch }
          }
        });
        // OS cutoff
        await prisma.cutoff.create({
          data: {
            collegeId: nitRkl.id,
            examId: jeeMain.id,
            cutoffValue: c.os,
            criteria: { category: 'OPEN', state: 'Other State', branch: c.branch }
          }
        });
      }
      console.log('Inserted new cutoffs for NIT Rourkela.');
    }
  } else {
    console.log('NIT Rourkela not found in database.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
