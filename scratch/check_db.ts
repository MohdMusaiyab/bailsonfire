import { prisma } from '../lib/prisma';

async function main() {
  const matches = await prisma.match.findMany({
    take: 5,
    select: {
      externalId: true,
      homeTeam: true,
      awayTeam: true,
    }
  });
  console.log("Matches found in DB:", JSON.stringify(matches, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
