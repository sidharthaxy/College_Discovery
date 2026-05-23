"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Clearing old database entries...');
    await prisma.review.deleteMany({});
    await prisma.cutoff.deleteMany({});
    await prisma.placement.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.college.deleteMany({});
    console.log('Seeding new database...');
    // 1. IIT Bombay
    const iitb = await prisma.college.create({
        data: {
            name: 'Indian Institute of Technology Bombay',
            slug: 'iit-bombay',
            logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
            coverUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80',
            rating: 4.8,
            location: 'Mumbai, Maharashtra',
            description: 'Established in 1958, IIT Bombay is a global leader in technology education and research, recognized for its world-class faculty and distinguished alumni network.',
            fees: 220000,
            intake: 1360,
            avgPackage: 21.82,
            highestPackage: 46.00,
            topRecruiters: ['Google', 'Microsoft', 'Qualcomm', 'Texas Instruments', 'Apple'],
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
                    { year: 2022, avgPackage: 19.5, highestPackage: 42.0 },
                    { year: 2023, avgPackage: 21.2, highestPackage: 45.0 },
                    { year: 2024, avgPackage: 21.82, highestPackage: 46.0 },
                ]
            },
            cutoffs: {
                create: [
                    { exam: 'JEE Advanced', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 67 },
                    { exam: 'JEE Advanced', category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 45 },
                    { exam: 'JEE Advanced', category: 'SC', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 25 },
                    { exam: 'JEE Advanced', category: 'OPEN', branch: 'Electrical Engineering', round: 6, cutoffRank: 290 },
                    { exam: 'JEE Advanced', category: 'OBC-NCL', branch: 'Electrical Engineering', round: 6, cutoffRank: 180 },
                ]
            },
            reviews: {
                create: [
                    { reviewerName: 'Aarav Mehta', rating: 5, comment: 'Phenomenal coding culture, top-notch infrastructure, and unmatched peer group. The campus life at Powai is unparalleled.', isVerified: true, status: 'APPROVED' },
                    { reviewerName: 'Sneha Patel', rating: 4, comment: 'The curriculum is highly demanding, but the placement opportunities and industry exposure make it completely worth it.', isVerified: true, status: 'APPROVED' },
                    { reviewerName: 'Rajesh Sharma', rating: 3, comment: 'Mess food is hit or miss, but otherwise campus life is awesome.', isVerified: false, status: 'APPROVED' },
                    { reviewerName: 'Amit Verma', rating: 5, comment: 'Great research facilities and friendly professors.', isVerified: false, status: 'PENDING' }
                ]
            }
        }
    });
    // 2. IIT Delhi
    const iitd = await prisma.college.create({
        data: {
            name: 'Indian Institute of Technology Delhi',
            slug: 'iit-delhi',
            logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
            coverUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop&q=80',
            rating: 4.7,
            location: 'New Delhi, Delhi',
            description: 'IIT Delhi is a premier public research university located in Hauz Khas, Delhi. It is one of the oldest IITs and ranks consistently among the top engineering colleges in India.',
            fees: 210000,
            intake: 1200,
            avgPackage: 20.50,
            highestPackage: 42.00,
            topRecruiters: ['Microsoft', 'Goldman Sachs', 'Uber', 'Intel', 'NVidia'],
            courses: {
                create: [
                    { name: 'Computer Science and Engineering', fees: 210000, duration: 4 },
                    { name: 'Electrical Engineering', fees: 210000, duration: 4 },
                    { name: 'Mechanical Engineering', fees: 210000, duration: 4 },
                    { name: 'Chemical Engineering', fees: 210000, duration: 4 },
                ]
            },
            placements: {
                create: [
                    { year: 2022, avgPackage: 18.0, highestPackage: 38.0 },
                    { year: 2023, avgPackage: 19.8, highestPackage: 40.0 },
                    { year: 2024, avgPackage: 20.5, highestPackage: 42.0 },
                ]
            },
            cutoffs: {
                create: [
                    { exam: 'JEE Advanced', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 115 },
                    { exam: 'JEE Advanced', category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 78 },
                    { exam: 'JEE Advanced', category: 'OPEN', branch: 'Electrical Engineering', round: 6, cutoffRank: 420 },
                ]
            },
            reviews: {
                create: [
                    { reviewerName: 'Devansh Gupta', rating: 5, comment: 'Hauz Khas campus has amazing proximity to startup hubs. The tech festivals like Tryst are super energetic.', isVerified: true, status: 'APPROVED' },
                    { reviewerName: 'Priya Sen', rating: 4, comment: 'Excellent placements. Academic load is heavy, but labs are highly advanced.', isVerified: true, status: 'APPROVED' }
                ]
            }
        }
    });
    // 3. IIT Madras
    const iitm = await prisma.college.create({
        data: {
            name: 'Indian Institute of Technology Madras',
            slug: 'iit-madras',
            logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
            coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&h=400&fit=crop&q=80',
            rating: 4.9,
            location: 'Chennai, Tamil Nadu',
            description: 'Ranked No. 1 in NIRF Engineering category consecutively, IIT Madras is celebrated for its highly successful research park, lush green forest campus, and academic brilliance.',
            fees: 215000,
            intake: 1100,
            avgPackage: 22.00,
            highestPackage: 48.00,
            topRecruiters: ['Google', 'Microsoft', 'Rubrik', 'Citadel', 'J.P. Morgan'],
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
                    { exam: 'JEE Advanced', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 85 },
                    { exam: 'JEE Advanced', category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 52 },
                    { exam: 'JEE Advanced', category: 'OPEN', branch: 'Electrical Engineering', round: 6, cutoffRank: 360 },
                ]
            },
            reviews: {
                create: [
                    { reviewerName: 'Vikram Sundar', rating: 5, comment: 'The ecosystem here is great. The IITM Research Park provides endless startup opportunities.', isVerified: true, status: 'APPROVED' }
                ]
            }
        }
    });
    // 4. NIT Trichy
    const nitt = await prisma.college.create({
        data: {
            name: 'National Institute of Technology Tiruchirappalli',
            slug: 'nit-trichy',
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
                    { exam: 'JEE Main', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 1500 },
                    { exam: 'JEE Main', category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 550 },
                    { exam: 'JEE Main', category: 'SC', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 320 },
                    { exam: 'JEE Main', category: 'OPEN', branch: 'Electronics and Communication Engineering', round: 6, cutoffRank: 3200 },
                ]
            },
            reviews: {
                create: [
                    { reviewerName: 'Karthik Raja', rating: 4, comment: 'Arguably the best NIT. The student club culture is very rich, and we get top recruiters similar to mid-level IITs.', isVerified: true, status: 'APPROVED' },
                    { reviewerName: 'Meera Krishnan', rating: 4, comment: 'Placements are excellent, though climate is extremely hot during summers. Pragyan is an amazing symposium!', isVerified: true, status: 'APPROVED' },
                    { reviewerName: 'Hrishikesh K', rating: 5, comment: 'The coding culture here is outstanding. Labs are open 24/7.', isVerified: false, status: 'PENDING' }
                ]
            }
        }
    });
    // 5. NIT Surathkal
    const nits = await prisma.college.create({
        data: {
            name: 'National Institute of Technology Karnataka, Surathkal',
            slug: 'nit-surathkal',
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
                    { exam: 'JEE Main', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 1684 },
                    { exam: 'JEE Main', category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 620 },
                    { exam: 'JEE Main', category: 'OPEN', branch: 'Information Technology', round: 6, cutoffRank: 2800 },
                ]
            },
            reviews: {
                create: [
                    { reviewerName: 'Rahul Naik', rating: 5, comment: 'Having a beach right on campus is just incredible. Placements are solid as well.', isVerified: true, status: 'APPROVED' }
                ]
            }
        }
    });
    // 6. NIT Rourkela
    const nitr = await prisma.college.create({
        data: {
            name: 'National Institute of Technology Rourkela',
            slug: 'nit-rourkela',
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
            courses: {
                create: [
                    { name: 'Computer Science and Engineering', fees: 140000, duration: 4 },
                    { name: 'Electronics and Instrumentation Engineering', fees: 140000, duration: 4 },
                    { name: 'Mechanical Engineering', fees: 140000, duration: 4 },
                ]
            },
            placements: {
                create: [
                    { year: 2023, avgPackage: 12.5, highestPackage: 25.0 },
                    { year: 2024, avgPackage: 13.5, highestPackage: 28.0 }
                ]
            },
            cutoffs: {
                create: [
                    { exam: 'JEE Main', category: 'OPEN', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 2400 },
                    { exam: 'JEE Main', category: 'OBC-NCL', branch: 'Computer Science and Engineering', round: 6, cutoffRank: 850 },
                ]
            },
            reviews: {
                create: [
                    { reviewerName: 'Sweta Mohanty', rating: 4, comment: 'Vast campus, lovely library, and nice food choices. Placements are great for CSE.', isVerified: true, status: 'APPROVED' }
                ]
            }
        }
    });
    console.log('Seeding finished successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
