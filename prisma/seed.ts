import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"

dotenv.config()

const sql = neon(process.env.DATABASE_URL!)

async function main() {
  console.log("Seeding database...")

  // Clean existing data
  await sql`DELETE FROM "Reservation"`
  await sql`DELETE FROM "Stock"`
  await sql`DELETE FROM "Product"`
  await sql`DELETE FROM "Warehouse"`

  // Create Warehouses
  const warehouses = await sql`
    INSERT INTO "Warehouse" (id, name, location)
    VALUES 
      (gen_random_uuid(), 'Mumbai Central', 'Mumbai, Maharashtra'),
      (gen_random_uuid(), 'Delhi North', 'Delhi, NCR'),
      (gen_random_uuid(), 'Bangalore South', 'Bangalore, Karnataka')
    RETURNING id, name
  `
  console.log("✅ Warehouses created")

  // Create Products
  const products = await sql`
    INSERT INTO "Product" (id, name, description, price, "createdAt")
    VALUES 
      (gen_random_uuid(), 'Vitamin D3 Supplements', 'High potency Vitamin D3 2000IU for immunity and bone health', 499.99, NOW()),
      (gen_random_uuid(), 'Whey Protein Powder', 'Chocolate flavored whey protein 1kg for muscle recovery', 1999.99, NOW()),
      (gen_random_uuid(), 'Blood Pressure Monitor', 'Digital automatic BP monitor with large display', 2499.99, NOW()),
      (gen_random_uuid(), 'Pulse Oximeter', 'Fingertip pulse oximeter for SpO2 and heart rate monitoring', 899.99, NOW())
    RETURNING id, name
  `
  console.log("✅ Products created")

  const [w1, w2, w3] = warehouses
  const [p1, p2, p3, p4] = products

  // Create Stock
  await sql`
    INSERT INTO "Stock" (id, "productId", "warehouseId", "totalUnits", "reservedUnits")
    VALUES
      (gen_random_uuid(), ${p1.id}, ${w1.id}, 10, 0),
      (gen_random_uuid(), ${p1.id}, ${w2.id}, 5, 0),
      (gen_random_uuid(), ${p1.id}, ${w3.id}, 2, 0),
      (gen_random_uuid(), ${p2.id}, ${w1.id}, 8, 0),
      (gen_random_uuid(), ${p2.id}, ${w2.id}, 3, 0),
      (gen_random_uuid(), ${p3.id}, ${w1.id}, 15, 0),
      (gen_random_uuid(), ${p3.id}, ${w3.id}, 1, 0),
      (gen_random_uuid(), ${p4.id}, ${w2.id}, 6, 0),
      (gen_random_uuid(), ${p4.id}, ${w3.id}, 4, 0)
  `
  console.log("✅ Stock created")
  console.log("🎉 Seeding complete!")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})