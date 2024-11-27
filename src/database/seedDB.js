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
      { name: 'create_user', desc: 'Allows creating a new user.' },
      { name: 'delete_user', desc: 'Allows deleting a user.' },
      { name: 'update_user', desc: 'Allows updating user details.' },
      { name: 'view_user', desc: 'Allows viewing user details.' },

      { name: 'create_product', desc: 'Allows creating a new product.' },
      { name: 'delete_product', desc: 'Allows deleting a product.' },
      { name: 'update_product', desc: 'Allows updating product details.' },
      { name: 'view_product', desc: 'Allows viewing product details.' },

      { name: 'create_blog', desc: 'Allows creating a new blog.' },
      { name: 'delete_blog', desc: 'Allows deleting a blog.' },
      { name: 'update_blog', desc: 'Allows updating blog details.' },
      { name: 'view_blog', desc: 'Allows viewing blog details.' },

      { name: 'create_order', desc: 'Allows creating a new order.' },
      { name: 'delete_order', desc: 'Allows deleting an order.' },
      { name: 'update_order', desc: 'Allows updating order details.' },
      { name: 'view_order', desc: 'Allows viewing order details.' },

      { name: 'create_activity', desc: 'Allows creating a new activity.' },
      { name: 'delete_activity', desc: 'Allows deleting an activity.' },
      { name: 'update_activity', desc: 'Allows updating activity details.' },
      { name: 'view_activity', desc: 'Allows viewing activity details.' },

      { name: 'view_variants', desc: 'Allows viewing variants details.' },
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
