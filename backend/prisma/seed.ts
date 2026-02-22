// Prisma Seed for Initial Data
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create demo owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@stayease.com' },
    update: {},
    create: {
      email: 'owner@stayease.com',
      username: 'demoowner',
      passwordHash: await bcrypt.hash('DemoOwner@123', 10),
      firstName: 'Demo',
      lastName: 'Owner',
      phone: '+1234567890',
      role: 'OWNER',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('Owner created:', owner);

  // Create demo guest
  const guest = await prisma.user.upsert({
    where: { email: 'guest@stayease.com' },
    update: {},
    create: {
      email: 'guest@stayease.com',
      username: 'demoguest',
      passwordHash: await bcrypt.hash('DemoGuest@123', 10),
      firstName: 'Demo',
      lastName: 'Guest',
      phone: '+0987654321',
      role: 'GUEST',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('Guest created:', guest);

  // Create sample property
  const property = await prisma.property.upsert({
    where: { id: 'demo-property-1' },
    update: {},
    create: {
      id: 'demo-property-1',
      ownerId: owner.id,
      title: 'Luxurious Beach Villa',
      description: 'A stunning beachfront villa with modern amenities',
      category: 'VILLA',
      location: '123 Beach Road, Malibu',
      city: 'Malibu',
      state: 'California',
      country: 'USA',
      zipCode: '90265',
      latitude: 34.0195,
      longitude: -118.6819,
      bedrooms: 5,
      bathrooms: 4,
      guests: 12,
      amenities: ['WiFi', 'Pool', 'Beach Access', 'Hot Tub', 'Chef Kitchen'],
      basePrice: 450,
      currency: 'USD',
      weeklyDiscount: 10,
      monthlyDiscount: 20,
      minNightStay: 2,
      maxNightStay: 90,
      bookingBuffer: 0,
      isActive: true,
      featured: true,
    },
  });

  console.log('Property created:', property);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
