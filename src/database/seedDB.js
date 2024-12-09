/* eslint-disable no-console */
import dotenv from 'dotenv'
import { ROLE } from '../constant/index.js'
import Permission from '../models/Permission.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

dotenv.config()

export const seedDatabase = async () => {
  try {
    const permissions = [
      {
        name: 'manager_product',
        desc: 'Allows View/Create/Edit/Delete Product.',
      },
      { name: 'view_product', desc: 'Allows Only View Product Details.' },

      {
        name: 'manager_variant',
        desc: 'Allows View/Create/Edit/Delete Variant.',
      },
      { name: 'view_variant', desc: 'Allows Only View Variant Details.' },

      { name: 'manager_tier', desc: 'Allows View/Create/Edit/Delete Tier.' },
      { name: 'view_tier', desc: 'Allows Only View Tier Details.' },

      { name: 'manager_blog', desc: 'Allows View/Create/Edit/Delete Blog.' },
      { name: 'view_blog', desc: 'Allows Only View Blog Details.' },

      {
        name: 'manager_manager',
        desc: 'Allows View/Create/Edit/Delete Manager.',
      },
      { name: 'view_manager', desc: 'Allows Only View Manager Details.' },

      {
        name: 'manager_user',
        desc: 'Allows View/Create/Edit/Delete User.',
      },
      { name: 'view_user', desc: 'Allows Only View User Details.' },

      { name: 'manager_order', desc: 'Allows View/Create/Edit/Delete Order.' },
      { name: 'view_order', desc: 'Allows Only View Order Details.' },
    ]

    await Promise.all(
      permissions.map(async (perm) => {
        const existing = await Permission.findOne({ name: perm.name })
        if (!existing) {
          return Permission.create({ name: perm.name, description: perm.desc })
        }
      })
    )

    const allPermissions = await Permission.find()
    const existingAdmin = await User.findOne({ email: 'admin@example.com' })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
      await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: hashedPassword,
        permissions: allPermissions.map((permission) => permission._id),
        role: ROLE.Admin,
      })
    } else {
      const adminPermissions = existingAdmin.permissions || []
      const newPermissions = allPermissions.filter(
        (perm) => !adminPermissions.includes(perm._id)
      )

      if (newPermissions.length > 0) {
        existingAdmin.permissions.push(
          ...newPermissions.map((perm) => perm._id)
        )
        await existingAdmin.save()
        console.log('Admin permissions updated.')
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}
