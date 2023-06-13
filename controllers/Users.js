import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { item, popItem, scannableitem }  from "../items/item.js";

export const Register = async(req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        const isEmailUsed = await Users.findOne({ where: { email } });

        // Periksa apakah email sudah digunakan sebelumnya
        if (isEmailUsed) {
            return res.status(400).json({ msg: "Email is already in use" });
        };

        // Periksa kecocokan password
        if (password !== confirmPassword) {
                return res.status(400).json({ msg: "Passwords do not match" });
        };

        // Periksa panjang password
        if (password.length < 8){
            return res.status(400).json({ msg: "Password must be at least 8 characters" });
        };

        // Buat hash dari password
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Simpan pengguna ke dalam basis data
        await Users.create({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({
            error: false,
            message: "User Created",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const Login = async(req, res) => {
    try {
        // Mencari pengguna berdasarkan email yang diberikan
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        // Membandingkan password yang dimasukkan dengan password pengguna yang ditemukan
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(403).json({msg: "Wrong Password"});

        // Mendapatkan userId, name, dan email dari objek user
        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;

        // Membuat access token menggunakan JSON Web Token (JWT)
        const accessToken = jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "20s"
        });

        // Membuat refresh token menggunakan JSON Web Token (JWT)
        const refreshToken = jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "1d"
        });

        // Memperbarui refresh token pengguna di database
        await Users.update({refresh_token: refreshToken},{
            where: {
                id: userId
            }
        });

        // Mengatur cookie refreshToken pada respons
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // secure: true (digunakan apabila menggunakan https)
        });

        // Mengirimkan respons dengan access token
        res.status(200).json({
            error: false,
            message: "success",
            loginResult: {
                name: name,
                email: email,
                token: accessToken
            }
        });

    } catch (error) {
        // Jika terjadi kesalahan, mengirimkan respons dengan pesan "Email does not match"
        res.status(404).json({ msg: "Email does not exists" });
    }
};

export const resetPassword = async(req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Cari pengguna berdasarkan email
        const user = await Users.findOne({ where: { email } });

        // Cari pengguna berdasarkan email
        if(!user) {
            return res.status(404).json({ msg: "Email does not exist"});
        };

        // Cek apakah password baru dan konfirmasi password cocok
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: "Password do not match."});
        };

        // Buat hash dari password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password pengguna di basis data
        await Users.update(
            { password: hashedPassword },
            { where: { email } }
        );

        res.status(200).json({ msg: "Password reset successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internet server error"});
    }
};

export const populeritems = async(req, res) => {

    res.status(200).json({ popItem });

};

export const scanitem = async(req, res) => {

    res.status(200).json({ scannableitem });

};

export const allitems = async(req, res) => {

    const { Nama } = req.query;

    if (typeof Nama !== 'undefined') {
        const search = item.filter((buah) => buah.Nama.toLowerCase().includes(Nama.toLowerCase()))
        res.status(200).json({ search });
    }
    else {
        res.status(200).json({ item });
    }
};

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken;

    // Periksa apakah refreshToken tersedia
    if(!refreshToken) return res.sendStatus(204);

    // Cari pengguna berdasarkan refreshToken
    const user = await Users.findOne({
        where: {
          refresh_token: refreshToken,
        },
      });
    
    // Periksa apakah pengguna ditemukan
      if (!user) {
        return res.sendStatus(204);
      }
    
      const userId = user.id;
    
      // Set refresh_token pengguna menjadi null
      await Users.update({ refresh_token: null }, { where: { id: userId } });
    
      // Hapus cookie refreshToken
      res.clearCookie("refreshToken");
      return res.sendStatus(200);
    };
