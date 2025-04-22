import { Router } from "express" // train exmaple, train ek route pe jati hai. so remember it thorugh this analogy
import cloudinary from "../lib/cloudinary.js"
import Book from "../models/Book.js"
import protectRoute from "../middleware/auth.middleware.js"

const router = Router()

router.get('/', async (req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page - 1) * limit

        const books = await Book.find()
            .sort({ createdAt: -1 }) //descendig order
            .skip(skip)
            .limit(limit)
            .populate("user", "profileImage", "username")
        // .populate("user", ["profileImage", "username"])

        const totalBooks = await Book.countDocuments()

        res.send({
            books,
            currentPage: page,
            totalBooks: totalBooks,
            totalPages: Math.ceil(totalBooks / limit)
        })

    } catch (error) {
        console.log("erros in getting books", error)
        res.status(500).json({ message: error.message })
    }
})


router.post('/', protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: 'please provide all fields' });


        }
        //! upload the image to cloudinary

        const uploadResponse = await cloudinary.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url

        // ! save to the datadase
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        })

        await newBook.save()
        res.status(201).json(newBook)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const books = await Book.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "username profileImage"); // optional if you want user info

        res.json({ books });
    } catch (error) {
        console.error("Error fetching books by user:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        if (!book) return res.status(400).send({ message: "book not found" })

        //?check if user is the owner of book
        if (book.user.toString() !== req.user._id.toString()) return res.status(401).send({ message: "not authorized" })
        //?delete image from cloudinary
        // Example Cloudinary URL:
        // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/qyup61vejflxxw8igvi0.png

        if (book.image && book.image.includes("cloudinary")) {
            try {
                // Step 1: Extract public ID from the Cloudinary image URL
                const publicId = book.image.split("/").pop().split(".")[0];

                // Step 2: Use Cloudinary's SDK to delete the image
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting image from Cloudinary", deleteError);
            }
        }

        //? delete from mongodb database
        await book.deleteOne()
        res.json({ message: "book deleted successfully" })
    } catch (error) {
        console.log("error in deleting book", error)
    }
})


export default router