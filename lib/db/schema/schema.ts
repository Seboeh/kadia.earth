import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer, pgEnum, numeric, date,
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 100}),
  email: varchar('email', {length: 255}).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', {length: 20}).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 100}).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', {length: 50}),
  subscriptionStatus: varchar('subscription_status', {length: 20}),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', {length: 50}).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', {length: 45}),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', {length: 255}).notNull(),
  role: varchar('role', {length: 50}).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', {length: 20}).notNull().default('pending'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}


// ---------------------------------------------
// Currency Enum
// ---------------------------------------------
export const currencyEnum = pgEnum("currency_enum", ["EUR", "USD"]);

// ---------------------------------------------
// Currency
// ---------------------------------------------
export const currency = pgTable("currency", {
  id: serial("id").primaryKey(),
  value: currencyEnum("value").notNull(),
});
export type CurrencyEntity = typeof currency.$inferSelect;
export type NewCurrencyEntity = typeof currency.$inferInsert;

// ---------------------------------------------
// MoneyAmount
// ---------------------------------------------
export const moneyAmount = pgTable("money_amount", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", {precision: 12, scale: 2}).notNull(),
  currencyId: integer("currency_id")
    .notNull()
    .references(() => currency.id, {onDelete: "restrict"}),
});
export type MoneyAmountEntity = typeof moneyAmount.$inferSelect;
export type NewMoneyAmountEntity = typeof moneyAmount.$inferInsert;

// ---------------------------------------------
// ProjectRuntime
// ---------------------------------------------
export const projectRuntime = pgTable("project_runtime", {
  id: serial("id").primaryKey(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // optional
});
export type ProjectRuntimeEntity = typeof projectRuntime.$inferSelect;
export type NewProjectRuntimeEntity = typeof projectRuntime.$inferInsert;

// ---------------------------------------------
// GeoCoordinates
// ---------------------------------------------
export const geocoordinates = pgTable("geocoordinates", {
  id: serial("id").primaryKey(),
  latitude: numeric("latitude", {precision: 9, scale: 6}).notNull(),
  longitude: numeric("longitude", {precision: 9, scale: 6}).notNull(),
});
export type GeocoordinatesEntity = typeof geocoordinates.$inferSelect;
export type NewGeocoordinatesEntity = typeof geocoordinates.$inferInsert;

// ---------------------------------------------
// Company
// ---------------------------------------------
export const company = pgTable("company", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});
export type CompanyEntity = typeof company.$inferSelect;
export type NewCompanyEntity = typeof company.$inferInsert;

// ---------------------------------------------
// ProjectGeneralInformation
// ---------------------------------------------
export const projectGeneralInformation = pgTable("project_general_information", {
  id: serial("id").primaryKey(),
  title: text("title"),
  sponsor: text("sponsor"),

  // Foreign Keys
  partnerCompanyId: integer("partner_company_id")
    .references(() => company.id, {onDelete: "set null"}),

  financingAmountId: integer("financing_amount_id")
    .references(() => moneyAmount.id, {onDelete: "set null"}),

  projectRuntimeId: integer("project_runtime_id")
    .references(() => projectRuntime.id, {onDelete: "set null"}),

  projectLocation: text("project_location"),
  protectedArea: text("protected_area"),

  areaCoordinatesId: integer("area_coordinates_id")
    .references(() => geocoordinates.id, {onDelete: "set null"}),
});
export type ProjectGeneralInformationEntity = typeof projectGeneralInformation.$inferSelect;
export type NewProjectGeneralInformationEntity = typeof projectGeneralInformation.$inferInsert;

// ---------------------------------------------
// Project
// ---------------------------------------------
export const project = pgTable("project", {
  id: serial("id").primaryKey(),
  projectGeneralInformationId: integer("project_general_information_id")
    .notNull()
    .references(() => projectGeneralInformation.id, {onDelete: "cascade"}),
});
export type ProjectEntity = typeof project.$inferSelect;
export type NewProjectEntity = typeof project.$inferInsert;

// ----------------------
// Relations
// ----------------------

export const teamsRelations = relations(teams, ({many}) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({many}) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({one}) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const projectRelations = relations(project, ({one}) => ({
  projectGeneralInformation: one(projectGeneralInformation, {
    fields: [project.projectGeneralInformationId],
    references: [projectGeneralInformation.id],
  }),
}));

export const projectGeneralInformationRelations = relations(projectGeneralInformation, ({one}) => ({
  partnerCompany: one(company, {
    fields: [projectGeneralInformation.partnerCompanyId],
    references: [company.id],
  }),
}));