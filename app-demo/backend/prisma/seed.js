const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@oldevops.fr' },
    update: {},
    create: {
      email: 'demo@oldevops.fr',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  const tasks = [
    { title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated builds and deployments', status: 'done', priority: 'high' },
    { title: 'Write API documentation', description: 'Document all REST endpoints with request/response examples', status: 'in_progress', priority: 'medium' },
    { title: 'Add unit tests', description: 'Increase test coverage to at least 80%', status: 'in_progress', priority: 'high' },
    { title: 'Set up monitoring', description: 'Configure Prometheus and Grafana dashboards', status: 'todo', priority: 'medium' },
    { title: 'Database backup strategy', description: 'Implement automated daily backups with retention policy', status: 'todo', priority: 'low' },
  ];

  for (const task of tasks) {
    await prisma.task.create({
      data: { ...task, userId: user.id },
    });
  }

  console.log(`Seeded: 1 user and ${tasks.length} tasks`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
