import { IMGSIZE, MIMETYPE, THUMBSIZE, UPLOADPATH, URLHOST } from "./config.js"
import { v4 as uuidv4 } from 'uuid'
import { createReadStream, createWriteStream, existsSync } from "fs"
import { isValidToken } from "./users.js"
import sharp from "sharp"

const resizeGambar = (dari, ke, width, height) => {
  try {
    const inStream = createReadStream(dari)
    const outStream = createWriteStream(ke)
    const transform = sharp().resize({ width, height })

    inStream.pipe(transform).pipe(outStream)

    return existsSync(ke)
  } catch (error) {
    console.error(error)
    return false
  }
  return true
}

const uploadgambar = async (req, res) => {
  if (await isValidToken(req, res) === '') return

  let ok = false
  let message = 'Gagal'
  let data = {}

  try {
    if (!req.files) {
      message = 'File gambar harus disertakan'
      res.status(400).json({ ok, message, data })
      return
    }
    const gambar = req.files.gambar
    if (!MIMETYPE.includes(gambar.mimetype)) {
      message = 'File harus berupa gambar dengan ektensi yang sudah ditentukan'
      res.status(400).json({ ok, message, data })
      return
    }
    let ekstensi = 'jpg'
    switch (gambar.mimetype) {
      case 'image/gif':
        ekstensi = 'gif'
        break;
      case 'image/png':
        ekstensi = 'png'
        break;
    }
    let gambarasli = ''
    let lokasigambar = ''
    let lokasithumbnail = ''

    let urlgambar = ''
    let urlthumbnail=''
    while (true) {
      const _uuid = uuidv4()
      gambarasli = `${UPLOADPATH}/orig-${_uuid}.${ekstensi}`
      lokasigambar = `${UPLOADPATH}/${_uuid}.${ekstensi}`
      lokasithumbnail = `${UPLOADPATH}/thumb-${_uuid}.${ekstensi}`

      urlgambar = `${URLHOST}/${_uuid}.${ekstensi}`
      urlthumbnail = `${URLHOST}/thumb-${_uuid}.${ekstensi}`
      if (!existsSync(lokasigambar)) break
    }
    await gambar.mv(gambarasli)

    if (!existsSync(gambarasli)) {
      message = 'Terdapat kesalahan, File tidak dapat disimpan'
      res.status(500).json({ ok, message, data })
      return
    }

    if (resizeGambar(gambarasli, lokasigambar, IMGSIZE[0], IMGSIZE[1]) === false) {
      message = 'Terdapat kesalahan, Gambar gagal disimpan'
      res.status(500).json({ ok, message, data })
      return
    }

    if (resizeGambar(gambarasli, lokasithumbnail, THUMBSIZE[0], THUMBSIZE[1]) === false) {
      message = 'Terdapat kesalahan, Gambar gagal disimpan'
      res.status(500).json({ ok, message, data })
      return
    }

    ok = true
    message = 'Gambar berhasil diupload'
    data = {
      gambar: urlgambar,
      thumbnail: urlthumbnail
    }
  } catch (error) {
    res.status(500).json({ ok, message: 'Terdapat kesalahan', data: error })
  }
  res.json({ ok, message, data })
}

export default uploadgambar