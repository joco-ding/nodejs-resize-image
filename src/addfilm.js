import promisePool from "./mydb.js"
import { isValidToken } from "./users.js"

const addFilm = async (req, res) => {
  if (await isValidToken(req, res) === '') return

  const { judul, kategori } = req.body

  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    const [rows, _] = await promisePool.execute(`INSERT INTO tb_films (judul,kategori) VALUES (?, ?)`, [judul, kategori])
    data = rows
    ok = true
    message = 'Berhasil'
  } catch (error) {
    data = error
  }

  res.json({ ok, message, data })
}

export default addFilm