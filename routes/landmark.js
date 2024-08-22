import { Router } from 'express'
import * as auth from '../middlewares/auth.js'

import { create, getAll } from '../controllers/landmark.js'

const router = Router()

router.post('/', auth.jwt, create)
router.get('/', getAll)

export default router
