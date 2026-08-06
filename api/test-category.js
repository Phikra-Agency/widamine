const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const motifs = await prisma.motif.findMany({
    include: { 
      practitionerAssignments: true,
      resourceAssignments: true,
      sessions: { orderBy: { number: "asc" } },
    },
  });
  
  console.log('Total motifs:', motifs.length);
  motifs.forEach(m => {
    console.log(`- ${m.name}: category = ${m.category}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
