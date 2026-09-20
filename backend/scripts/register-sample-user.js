const { PrismaClient } = require('@prisma/client');
const { createHash } = require('crypto');

const prisma = new PrismaClient();

async function main() {
  const email = 'newcustomer@example.com';
  const password = 'customer123';

  const payload = {
    full_name: 'Test Customer',
    email,
    phone: '+85512345678',
    password_hash: createHash('sha256').update(password).digest('hex'),
    role: 'Customer',
  };

  const user = await prisma.user.upsert({
    where: { email },
    update: payload,
    create: payload,
  });

  console.log('USER_CREATED', JSON.stringify({
    id: user.user_id,
    name: user.full_name,
    email: user.email,
    role: user.role,
  }));
}

main()
  .catch((error) => {
    console.error('DB_ERROR');
    console.error(error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
