import { sql } from "@vercel/postgres";
import { IDN_DATA, HOSPITAL_DATA } from "./data";

export async function initDB() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS idns (
      id          INTEGER PRIMARY KEY,
      name        TEXT NOT NULL,
      hq_state    CHAR(2),
      hospital_count INTEGER,
      total_beds  INTEGER,
      net_patient_revenue NUMERIC(8,2),
      annual_discharges INTEGER,
      ownership   TEXT,
      color       TEXT
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hospitals (
      id          INTEGER PRIMARY KEY,
      name        TEXT NOT NULL,
      city        TEXT,
      state       CHAR(2),
      beds        INTEGER,
      idn_id      INTEGER REFERENCES idns(id),
      idn_name    TEXT,
      type        TEXT,
      ownership   TEXT
    )
  `;

  // Check if already seeded
  const { rows } = await sql`SELECT COUNT(*) as c FROM idns`;
  if (parseInt(rows[0].c) > 0) return { seeded: false, message: "Already seeded" };

  // Seed IDNs
  for (const idn of IDN_DATA) {
    await sql`
      INSERT INTO idns (id, name, hq_state, hospital_count, total_beds, net_patient_revenue, annual_discharges, ownership, color)
      VALUES (${idn.id}, ${idn.name}, ${idn.hq_state}, ${idn.hospital_count}, ${idn.total_beds}, ${idn.net_patient_revenue}, ${idn.annual_discharges}, ${idn.ownership}, ${idn.color})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Seed hospitals
  for (const h of HOSPITAL_DATA) {
    await sql`
      INSERT INTO hospitals (id, name, city, state, beds, idn_id, idn_name, type, ownership)
      VALUES (${h.id}, ${h.name}, ${h.city}, ${h.state}, ${h.beds}, ${h.idn_id}, ${h.idn_name}, ${h.type}, ${h.ownership})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  return { seeded: true, message: `Seeded ${IDN_DATA.length} IDNs and ${HOSPITAL_DATA.length} hospitals` };
}
