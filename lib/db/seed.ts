import {db} from './drizzle';
import {users, teams, teamMembers, project, company, projectGeneralInformation} from './schema/schema';
import {hashPassword} from '@/lib/auth/session';

async function seed(): Promise<void> {

  db.delete(teamMembers);
  db.delete(teams);
  db.delete(users);
  db.delete(company);
  db.delete(projectGeneralInformation);
  db.delete(project);

  /*====================================================================================================================
  Creating Sample user
  ====================================================================================================================*/
  console.log('Creating user...');
  const email = 'kadia@kadia.com';
  const password = 'kadiaAdmin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();
  console.log('Initial user created.');

  /*====================================================================================================================
  Creating Sample team
  ====================================================================================================================*/
  console.log('Creating team...');
  const [team] = await db
    .insert(teams)
    .values({
      name: 'kadia team',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });
  console.log('Initial team created.');
  /*====================================================================================================================
  Creating Sample project data
  ====================================================================================================================*/
  console.log('Creating project...');
  const [comp] = await db.insert(company).values({
    name: "kadia"
  }).returning();

  const [projectGeneralInfo] = await db.insert(projectGeneralInformation).values({
    title: 'test project name',
    sponsor: 'test sponsor name',
    partnerCompanyId: comp.id,
    financingAmountId: null,
    projectRuntimeId: null,
    projectLocation: null,
    protectedArea: null,
    areaCoordinatesId: null
  }).returning();

  const [proj] = await db.insert(project).values({
    projectGeneralInformationId: projectGeneralInfo.id
  });
  console.log('Initial project created.');

}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
