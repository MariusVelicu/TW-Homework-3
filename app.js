import express from 'express'
import Sequelize from 'sequelize'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()
// TODO
app.use(express.json());

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

app.post('/food-items', async (req, res) => {
    try{
        // TODO
        const body = req.body;

        // Verifică dacă corpul request-ului este gol sau nedefinit
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ "message": "body is missing" });
        }

        // Verifică dacă există proprietățile necesare în corpul request-ului
        const requiredProperties = ['name', 'category', 'calories'];
        for (const prop of requiredProperties) {
            if (!(prop in body)) {
                return res.status(400).json({ "message": "malformed request" });
            }
        }

        // Verifică dacă numărul de calorii este un număr pozitiv
        if (typeof body.calories !== 'number' || body.calories <= 0) {
            return res.status(400).json({ "message": "calories should be a positive number" });
        }

        // Verifică dacă categoria este validă
        const allowedCategories = ['DAIRY', 'MEAT', 'FRUIT', 'VEGETABLE', 'GRAIN'];
        if (!allowedCategories.includes(body.category)) {
            return res.status(400).json({ "message": "not a valid category" });
        }

        // Adaugă noul obiect în lista de foodItems
        await FoodItem.create(body);

        // Răspunde cu statusul 201 și mesajul "created"
        return res.status(201).json({ "message": "created" });
    }
    catch(err){
        // TODO
        console.warn(err.stack);
        // TODO: Puteți adăuga o logică suplimentară aici, dacă este necesar
        return res.status(500).json({ "message": "server error" });
    }
})

export default app