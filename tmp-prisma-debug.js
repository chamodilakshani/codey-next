const prisma = require('./lib/prisma');
console.log('keys', Object.keys(prisma));
console.log('has level', Object.prototype.hasOwnProperty.call(prisma, 'level'));
console.log('type level', typeof prisma.level);
console.log('level keys', prisma.level ? Object.keys(prisma.level).slice(0, 20) : undefined);
