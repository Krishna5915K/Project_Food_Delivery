require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const Food = require('../models/Food');

const seedData = async (shouldExit = true) => {
    try {
        if (mongoose.connection.readyState === 0) {
            console.log('Connecting to database...');
            await connectDB();
        }

        // 1. Create/Retrieve Partner Owner User
        console.log('Checking for Restaurant Owner user...');
        let owner = await User.findOne({ email: 'owner@foodclone.com' });
        if (!owner) {
            owner = await User.create({
                name: 'Partner Owner',
                email: 'owner@foodclone.com',
                password: 'Password123',
                phone: '+919999999999',
                role: 'restaurant_owner',
                isEmailVerified: true,
                status: 'active'
            });
            console.log('Created new Restaurant Owner user.');
        } else {
            console.log('Using existing Restaurant Owner user.');
        }

        // 2. Clear Existing Collections
        console.log('Clearing existing categories, restaurants, and foods...');
        await Food.deleteMany({});
        await Category.deleteMany({});
        await Restaurant.deleteMany({});

        // 3. Create Restaurants (Platform Swiggy, Zomato, FoodClone, both)
        console.log('Seeding restaurants...');
        const restaurantsData = [
            {
                name: 'Swiggy Gourmet Kitchen',
                owner: owner._id,
                description: 'Authentic gourmet Italian and woodfired pizzas delivered instantly by Swiggy.',
                address: '102 Indiranagar, Bangalore',
                location: { type: 'Point', coordinates: [77.6404, 12.9716] },
                cuisineType: ['Italian', 'Pizza'],
                averageRating: 4.5,
                totalRatings: 120,
                isApproved: true,
                status: 'open',
                platform: 'Swiggy',
                logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500',
                banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000',
                deliveryTimeMinutes: 25,
                minOrderAmount: 200
            },
            {
                name: 'Swiggy Fast & Fresh',
                owner: owner._id,
                description: 'Quick-bite American fast foods, burgers, and sides.',
                address: '45 Koramangala 5th Block, Bangalore',
                location: { type: 'Point', coordinates: [77.6244, 12.9348] },
                cuisineType: ['Fast Food', 'Burgers'],
                averageRating: 4.2,
                totalRatings: 95,
                isApproved: true,
                status: 'open',
                platform: 'Swiggy',
                logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500',
                banner: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000',
                deliveryTimeMinutes: 20,
                minOrderAmount: 150
            },
            {
                name: 'Zomato Spicy Bistro',
                owner: owner._id,
                description: 'Delicious traditional North Indian curries and authentic Chinese noodles.',
                address: '88 MG Road, Bangalore',
                location: { type: 'Point', coordinates: [77.5946, 12.9716] },
                cuisineType: ['Indian', 'Chinese'],
                averageRating: 4.4,
                totalRatings: 150,
                isApproved: true,
                status: 'open',
                platform: 'Zomato',
                logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
                banner: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000',
                deliveryTimeMinutes: 30,
                minOrderAmount: 180
            },
            {
                name: 'Zomato Sweet Palace',
                owner: owner._id,
                description: 'Heavenly desserts, mocktails, and fresh custom beverages.',
                address: '14 Whitefield Main Road, Bangalore',
                location: { type: 'Point', coordinates: [77.7499, 12.9698] },
                cuisineType: ['Desserts', 'Beverages'],
                averageRating: 4.6,
                totalRatings: 180,
                isApproved: true,
                status: 'open',
                platform: 'Zomato',
                logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
                banner: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1000',
                deliveryTimeMinutes: 35,
                minOrderAmount: 100
            },
            {
                name: 'Swiggy Local Diner',
                owner: owner._id,
                description: 'Home-style Indian meals and fast food combos delivered by Swiggy.',
                address: '32 HSR Layout Sector 3, Bangalore',
                location: { type: 'Point', coordinates: [77.6387, 12.9103] },
                cuisineType: ['Indian', 'Fast Food'],
                averageRating: 4.1,
                totalRatings: 60,
                isApproved: true,
                status: 'open',
                platform: 'Swiggy',
                logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500',
                banner: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000',
                deliveryTimeMinutes: 25,
                minOrderAmount: 120
            },
            {
                name: 'Swiggy & Zomato Grand Feast',
                owner: owner._id,
                description: 'A multi-cuisine luxury buffet serving Italian, Pizza, Burgers, and Chinese.',
                address: '77 Jayanagar 4th Block, Bangalore',
                location: { type: 'Point', coordinates: [77.5824, 12.9279] },
                cuisineType: ['Italian', 'Chinese', 'Burgers', 'Pizza'],
                averageRating: 4.7,
                totalRatings: 210,
                isApproved: true,
                status: 'open',
                platform: 'both',
                logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
                banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000',
                deliveryTimeMinutes: 40,
                minOrderAmount: 300
            }
        ];

        const restaurants = await Restaurant.create(restaurantsData);
        console.log(`Seeded ${restaurants.length} restaurants successfully.`);

        // 4. Seed Categories
        console.log('Seeding global categories...');
        const categoriesMap = {};
        const categoriesList = ['Italian', 'Chinese', 'Indian', 'Fast Food', 'Desserts', 'Beverages', 'Pizza', 'Burgers'];
        
        for (const catName of categoriesList) {
            const cat = await Category.create({
                name: catName,
                restaurant: restaurants[0]._id,
                description: `Delicious ${catName} food items`,
                isActive: true
            });
            categoriesMap[catName] = cat._id;
        }
        console.log(`Seeded ${categoriesList.length} categories.`);

        // 5. Seed Food Items (20 distinct items per category)
        console.log('Generating 160 food items dataset...');
        const foodsData = [];

        const menuItemsDataset = {
            'Italian': [
                { name: 'Truffle Mushroom Pasta', description: 'Creamy fettuccine pasta loaded with wild mushrooms and truffle oil.', price: 299, isVeg: true, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500' },
                { name: 'Classic Lasagna', description: 'Rich baked layers of pasta sheets, minced chicken, mozzarella, and marinara.', price: 349, isVeg: false, image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500' },
                { name: 'Creamy Pesto Penne', description: 'Fresh penne tossed in rich basil pesto sauce and garnished with pine nuts.', price: 279, isVeg: true, image: 'https://images.unsplash.com/photo-1563379971899-660589a01cc3?w=500' },
                { name: 'Risotto ai Funghi', description: 'Traditional Italian arborio rice cooked with cream, parmesan, and button mushrooms.', price: 329, isVeg: true, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500' },
                { name: 'Spaghetti Carbonara', description: 'Spaghetti tossed with egg yolks, hard cheese, cured pork, and black pepper.', price: 319, isVeg: false, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500' },
                { name: 'Tomato Basil Bruschetta', description: 'Toasted garlic-rubbed bread topped with diced tomatoes, basil, and olive oil.', price: 159, isVeg: true, image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=500' },
                { name: 'Spinach Ricotta Ravioli', description: 'Handmade ravioli filled with fresh spinach and creamy ricotta cheese.', price: 299, isVeg: true, image: 'https://images.unsplash.com/photo-1595295333158-4742f28fbe93?w=500' },
                { name: 'Potato Gnocchi Sorrento', description: 'Soft potato dumplings baked in rich tomato sauce and fresh mozzarella.', price: 269, isVeg: true, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500' },
                { name: 'Minestrone Soup', description: 'Thick Italian vegetable soup with added pasta and beans.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500' },
                { name: 'Caprese Salad with Pesto', description: 'Sliced fresh mozzarella, tomatoes, and sweet basil, drizzled with olive oil.', price: 199, isVeg: true, image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=500' },
                { name: 'Fettuccine Alfredo', description: 'Rich fettuccine pasta tossed in butter and heavy parmesan cheese sauce.', price: 289, isVeg: true, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=500' },
                { name: 'Chicken Parmigiana', description: 'Breaded chicken breast topped with marinara sauce and melted cheese.', price: 359, isVeg: false, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500' },
                { name: 'Italian Meatballs', description: 'Savory beef meatballs simmered in slow-cooked pomodoro sauce.', price: 299, isVeg: false, image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500' },
                { name: 'Garlic Herb Calzone', description: 'Folded pizza pocket stuffed with cheese, garlic, and mixed herbs.', price: 219, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Panzerotti Bites', description: 'Crispy fried mini calzones filled with mozzarella and tomato.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Bruschetta Pomodoro', description: 'Italian toast topped with ripe tomatoes, garlic, olive oil, and balsamic.', price: 169, isVeg: true, image: 'https://images.unsplash.com/photo-1572656631137-7935297eff55?w=500' },
                { name: 'Panna Cotta Classic', description: 'Chilled Italian molded cream dessert served with mixed berry coulis.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500' },
                { name: 'Focaccia Bread with Rosemary', description: 'Oven-baked Italian flatbread seasoned with olive oil, sea salt, and fresh rosemary.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500' },
                { name: 'Italian Wedding Soup', description: 'Traditional green vegetable broth filled with tiny meatballs and pasta.', price: 199, isVeg: false, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500' },
                { name: 'Polenta with Wild Mushrooms', description: 'Creamy cornmeal porridge topped with sautéed wild mushrooms and garlic.', price: 249, isVeg: true, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500' }
            ],
            'Chinese': [
                { name: 'Schezwan Noodles', description: 'Spicy noodles stir-fried with vegetables and robust Schezwan sauce.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500' },
                { name: 'Steamed Chicken Dumplings', description: 'Fresh minced chicken stuffed dumplings, steamed and served with ginger dip.', price: 149, isVeg: false, image: 'https://images.unsplash.com/photo-1496116211227-7c3ccb8f588d?w=500' },
                { name: 'Veg Spring Rolls', description: 'Crispy wrappers filled with stir-fried cabbage, carrots, and glass noodles.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' },
                { name: 'Yangzhou Fried Rice', description: 'Wok-tossed jasmine rice with vegetables, green onions, and egg.', price: 199, isVeg: true, image: 'https://images.unsplash.com/photo-1603133872878-6966b46880a0?w=500' },
                { name: 'Sweet & Sour Chicken', description: 'Crispy chicken cubes tossed with pineapple, bell peppers, and sweet-sour glaze.', price: 279, isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500' },
                { name: 'Mapo Tofu', description: 'Silken tofu set in spicy, Sichuan pepper-infused chili bean paste.', price: 219, isVeg: true, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500' },
                { name: 'Kung Pao Chicken', description: 'Stir-fried chicken cubes with peanuts, bell peppers, and dried red chilies.', price: 289, isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500' },
                { name: 'Veg Manchurian Gravy', description: 'Deep-fried vegetable balls in a tangy, spicy soy-based gravy sauce.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500' },
                { name: 'Egg Chow Mein', description: 'Stir-fried Chinese wheat noodles cooked with sliced egg and green onion.', price: 169, isVeg: false, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500' },
                { name: 'Hot & Sour Soup', description: 'Spicy and sour broth loaded with bamboo shoots, tofu, and wood ear mushrooms.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500' },
                { name: 'Wonton Soup', description: 'Savory broth containing handmade pork and shrimp wontons.', price: 159, isVeg: false, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500' },
                { name: 'Chilli Paneer Dry', description: 'Crispy cottage cheese cubes tossed in spicy soy-chili sauce and green peppers.', price: 229, isVeg: true, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500' },
                { name: 'Honey Chilli Potato', description: 'Crispy potato fingers glazed in sweet honey chili sauce and sesame seeds.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500' },
                { name: 'Beijing Roast Duck Wraps', description: 'Shredded roasted duck wraps served with scallions and rich hoisin sauce.', price: 349, isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500' },
                { name: 'Dim Sum Platter', description: 'Assorted basket of steamed vegetarian and non-vegetarian dim sums.', price: 299, isVeg: true, image: 'https://images.unsplash.com/photo-1496116211227-7c3ccb8f588d?w=500' },
                { name: 'Kung Pao Tofu', description: 'Stir-fried tofu cubes with roasted peanuts and red chili flakes in spicy glaze.', price: 199, isVeg: true, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=500' },
                { name: 'Sichuan Chili Chicken', description: 'Spicy chicken dry toss loaded with Sichuan peppercorns and dry chilies.', price: 289, isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500' },
                { name: 'Vegetable Chow Mein', description: 'Traditional stir-fried noodles loaded with carrots, cabbage, and soy sauce.', price: 159, isVeg: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500' },
                { name: 'Egg Drop Soup', description: 'Warm chicken broth containing wispy beaten eggs and green onions.', price: 129, isVeg: false, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500' },
                { name: 'Crispy Sesame Chicken', description: 'Battered sweet chicken pieces glazed with honey soy and sesame seed garnish.', price: 269, isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500' }
            ],
            'Indian': [
                { name: 'Butter Chicken with Naan', description: 'Creamy tomato-based clay oven chicken served with hot buttered garlic naan.', price: 279, isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500' },
                { name: 'Paneer Butter Masala Combo', description: 'Rich cottage cheese cubes cooked in butter gravy, served with jeera rice.', price: 249, isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500' },
                { name: 'Hyderabadi Chicken Biryani', description: 'Fragrant basmati rice layered with spiced chicken, mint, and saffron.', price: 299, isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
                { name: 'Dal Makhani Combo', description: 'Slow-cooked black lentils in rich cream, served with Laccha Paratha.', price: 229, isVeg: true, image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500' },
                { name: 'Paneer Tikka Kebab', description: 'Clay-oven roasted cottage cheese blocks marinated in yogurt and spices.', price: 219, isVeg: true, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500' },
                { name: 'Chole Bhature', description: 'Spiced chickpeas curry served with deep-fried leavened flatbreads.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=500' },
                { name: 'Punjabi Samosa Chana', description: 'Crispy fried potato triangular pastries topped with chickpea curry and chutneys.', price: 89, isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500' },
                { name: 'Masala Dosa with Sambar', description: 'Crispy rice crêpe filled with spiced potato mash, coconut chutney, and sambar.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500' },
                { name: 'Steamed Idli with Chutney', description: 'Soft fermented savory rice cakes served with sambar and fresh mint chutney.', price: 89, isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500' },
                { name: 'Gulab Jamun (2 Pcs)', description: 'Golden fried milk solid balls soaked in sweet rose cardamom syrup.', price: 69, isVeg: true, image: 'https://images.unsplash.com/photo-1589301775847-ba306574686b?w=500' },
                { name: 'Kadhai Paneer Gravy', description: 'Cottage cheese cooked in a spicy tomato capsicum gravy with freshly ground spices.', price: 239, isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500' },
                { name: 'Chicken Tikka Masala', description: 'Roasted marinated chicken chunks in a spiced creamy tomato gravy sauce.', price: 289, isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500' },
                { name: 'Mutton Rogan Josh', description: 'Slow-cooked lamb stew seasoned with Kashmiri dry red chilies and spices.', price: 399, isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500' },
                { name: 'Garlic Butter Naan', description: 'Flatbread topped with minced garlic and brushed with rich butter.', price: 59, isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500' },
                { name: 'Tandoori Chicken (Half)', description: 'Clay-oven roasted chicken marinated in spicy tandoori yogurt blend.', price: 269, isVeg: false, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500' },
                { name: 'Samosa Chaat', description: 'Crushed crispy samosas topped with chickpeas, yogurt, sweet and tangy chutneys.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500' },
                { name: 'Aloo Gobi Mutter', description: 'Spiced home-style dry curry cooked with potatoes, cauliflower, and peas.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500' },
                { name: 'Chicken Korma', description: 'Rich chicken stew simmered with almonds, yogurt, saffron, and cardamom.', price: 299, isVeg: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500' },
                { name: 'Mutton Seekh Kebab', description: 'Minced spiced lamb skewers grilled in clay oven and served with mint dip.', price: 349, isVeg: false, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500' },
                { name: 'Peshawari Naan', description: 'Sweet flatbread filled with crushed almonds, raisins, coconut, and butter.', price: 79, isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500' }
            ],
            'Fast Food': [
                { name: 'Crispy Chicken Strips', description: 'Crunchy golden fried boneless chicken strips with garlic mayo dip.', price: 159, isVeg: false, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
                { name: 'Peri Peri French Fries', description: 'Crispy potato fries tossed in hot African peri-peri spices.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
                { name: 'Loaded Cheese Nachos', description: 'Crispy tortilla chips topped with cheese sauce, jalapenos, and sour cream.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
                { name: 'Hot Dog Classic', description: 'Toasted bun containing a chicken sausage, mustard, and tomato sauce.', price: 139, isVeg: false, image: 'https://images.unsplash.com/photo-1627059313773-ac652136eef2?w=500' },
                { name: 'Golden Onion Rings', description: 'Breaded and deep-fried sweet onion rings served with BBQ sauce.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=500' },
                { name: 'Mozzarella Cheese Sticks', description: 'Golden fried herb breaded cheese sticks filled with stretchy mozzarella.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1531749668029-2db88e4b76ce?w=500' },
                { name: 'Chicken Nuggets (8 Pcs)', description: 'Crispy bite-sized pieces of breaded boneless chicken breasts.', price: 129, isVeg: false, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
                { name: 'Spicy Paneer Wrap', description: 'Wheat wrap loaded with crispy paneer cubes, spicy dressing, and raw onions.', price: 159, isVeg: true, image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500' },
                { name: 'Chicken Caesar Wrap', description: 'Grilled chicken breast pieces, lettuce, and Caesar dressing inside a tortilla.', price: 179, isVeg: false, image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500' },
                { name: 'Mexican Quesadillas', description: 'Toasted flour tortillas filled with melted cheese, bell peppers, and corn.', price: 199, isVeg: true, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' },
                { name: 'Chilli Cheese Fries', description: 'Golden fries smothered in chili bean sauce and loaded with cheddar cheese.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
                { name: 'BBQ Chicken Wings', description: 'Deep-fried chicken wings glazed in sweet and smoky hickory BBQ sauce.', price: 219, isVeg: false, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500' },
                { name: 'Cheesy Garlic Bread', description: 'Toasted French bread brushed with butter, garlic, and loaded cheese.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=500' },
                { name: 'Popcorn Chicken', description: 'Crispy fried small chunks of chicken seasoned with cayenne pepper.', price: 169, isVeg: false, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
                { name: 'Veg Puff Pastry', description: 'Flaky baked pastry filled with spicy masala potato and peas.', price: 49, isVeg: true, image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500' },
                { name: 'Sweet Potato Fries', description: 'Slightly sweet, salted crispy orange potato fries served with honey mustard.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500' },
                { name: 'Crispy Fish Fingers', description: 'Crumbed fried sea fish strips served with creamy dill tartar sauce.', price: 189, isVeg: false, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500' },
                { name: 'Chili Cheese Hot Dog', description: 'Warm chicken sausage in a bun topped with hot chili mince and liquid cheese.', price: 169, isVeg: false, image: 'https://images.unsplash.com/photo-1627059313773-ac652136eef2?w=500' },
                { name: 'Tandoori Paneer Roll', description: 'Charred paneer cubes in flatbread wrap layered with mint chutney.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=500' },
                { name: 'Spicy Cheese Quesadilla', description: 'Griddle toasted flatbread folded with spicy peppers, corn, and cheddar.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500' }
            ],
            'Desserts': [
                { name: 'Hot Chocolate Brownie', description: 'Warm fudge chocolate brownie topped with chocolate syrup and vanilla ice cream.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' },
                { name: 'Red Velvet Cheesecake', description: 'Decadent baked cream cheese slice with a red velvet crumb crust.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500' },
                { name: 'New York Baked Cheesecake', description: 'Classic dense baked cream cheese dessert slice topped with raspberry glaze.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500' },
                { name: 'Chocolate Truffle Cake Slice', description: 'Rich layered chocolate sponge cake filled with dark chocolate ganache.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' },
                { name: 'Warm Waffle with Nutella', description: 'Freshly baked grid waffle drizzled with Nutella spread and hazelnut crumbs.', price: 169, isVeg: true, image: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=500' },
                { name: 'Fluffy Pancakes with Syrup', description: 'Three stacked hot cakes served with maple syrup and soft butter pat.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500' },
                { name: 'Assorted French Macarons', description: 'Box of 4 colorful almond-flour biscuits filled with sweet chocolate ganache.', price: 199, isVeg: true, image: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=500' },
                { name: 'Glazed Chocolate Donut', description: 'Sweet ring-shaped fried dough topped with chocolate icing glaze.', price: 79, isVeg: true, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500' },
                { name: 'Vanilla Cupcake', description: 'Soft vanilla sponge cupcake frosted with pink buttercream piping.', price: 69, isVeg: true, image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500' },
                { name: 'Mango Pudding', description: 'Sweet gelatinous mango custard topped with fresh cream.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' },
                { name: 'Chocolate Mousse Cup', description: 'Light and airy chocolate cream cup garnished with chocolate shavings.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' },
                { name: 'Apple Pie with Ice Cream', description: 'Warm spiced apple filling inside flaky pastry crust, with vanilla bean ice cream.', price: 159, isVeg: true, image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500' },
                { name: 'Choco Lava Cake', description: 'Hot chocolate cake containing a melted chocolate core, served warm.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500' },
                { name: 'Tiramisu Dessert Cup', description: 'Espresso-soaked sponge cake layers and sweetened mascarpone cream cup.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500' },
                { name: 'Gulab Jamun Ice Cream', description: 'Sweet custom rose-cardamom flavored ice cream containing sliced jamuns.', price: 109, isVeg: true, image: 'https://images.unsplash.com/photo-1589301775847-ba306574686b?w=500' },
                { name: 'Crème Brûlée', description: 'Classic custard dessert topped with a layer of hardened caramelized sugar.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500' },
                { name: 'Warm Apple Crumble', description: 'Spiced baked apple cubes topped with sweet oat and flour crumble topping.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500' },
                { name: 'Triple Chocolate Muffin', description: 'Warm chocolate muffin baked with dark, milk, and white chocolate chips.', price: 89, isVeg: true, image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500' },
                { name: 'Classic Lemon Tart', description: 'Pastry case filled with smooth, zesty, and sweet lemon curd.', price: 139, isVeg: true, image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=500' },
                { name: 'Banana Split Sundae', description: 'Split banana served with vanilla, chocolate, strawberry ice cream and cherries.', price: 169, isVeg: true, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500' }
            ],
            'Beverages': [
                { name: 'Classic Mint Mojito', description: 'Refreshing carbonated lime beverage muddled with mint leaves and ice.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
                { name: 'Mango Milkshake', description: 'Creamy cold beverage blended with sweet Alphonso mango pulp and milk.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500' },
                { name: 'Iced Caramel Latte', description: 'Cold espresso beverage sweetened with vanilla syrup and caramel drizzle.', price: 139, isVeg: true, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500' },
                { name: 'Cold Brew Coffee', description: 'Slow steeped black coffee served cold over ice blocks.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500' },
                { name: 'Fresh Lime Soda', description: 'Spiced lime beverage prepared with sparkling soda water.', price: 79, isVeg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
                { name: 'Peach Iced Tea', description: 'Brewed black tea flavored with sweet peach syrup and mint leaves.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
                { name: 'Strawberry Smoothie', description: 'Healthy thick smoothie prepared with fresh strawberries and Greek yogurt.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500' },
                { name: 'Hot Chocolate with Marshmallows', description: 'Rich dark hot chocolate cup topped with sweet white marshmallows.', price: 139, isVeg: true, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500' },
                { name: 'Matcha Green Tea Latte', description: 'Whisked organic Japanese matcha green tea powder with steamed milk.', price: 159, isVeg: true, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500' },
                { name: 'Detox Green Juice', description: 'Cold-pressed juice prepared with cucumber, spinach, green apple, and ginger.', price: 129, isVeg: true, image: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?w=500' },
                { name: 'Oreo Shake', description: 'Decadent chocolate milkshake containing crushed Oreo biscuits and vanilla ice cream.', price: 139, isVeg: true, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500' },
                { name: 'Virgin Piña Colada', description: 'Frozen mocktail prepared with sweet pineapple juice and coconut cream.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
                { name: 'Blue Lagoon Mocktail', description: 'Fizzy carbonated citrus beverage containing blue curacao syrup.', price: 119, isVeg: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500' },
                { name: 'Hot Ginger Tea', description: 'Traditional Indian chai brewed with milk, black tea, and crushed ginger.', price: 49, isVeg: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
                { name: 'Espresso Shot', description: 'Fresh double shot of dark roasted espresso beans.', price: 79, isVeg: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
                { name: 'Double Espresso Macchiato', description: 'Double shot espresso topped with a small dollop of foamed milk.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500' },
                { name: 'Ginger Lemon Tea', description: 'Hot water infused with fresh ginger root slices, lemon juice, and honey.', price: 59, isVeg: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
                { name: 'Avocado Milkshake', description: 'Rich creamy health shake blended with fresh avocado flesh and honey.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500' },
                { name: 'Spiced Masala Chai', description: 'Indian black tea leaves boiled with cardamom, cinnamon, cloves, and milk.', price: 49, isVeg: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500' },
                { name: 'Watermelon Mint Juice', description: 'Freshly pressed cold watermelon juice with muddled mint leaves.', price: 109, isVeg: true, image: 'https://images.unsplash.com/photo-1610970881699-44a5587caa9a?w=500' }
            ],
            'Pizza': [
                { name: 'Margherita Pizza', description: 'Thick sourdough crust topped with premium marinara, fresh basil, and mozzarella.', price: 249, isVeg: true, image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500' },
                { name: 'Double Cheese Pepperoni Pizza', description: 'Extra loaded mozzarella cheese and spicy Italian pepperoni chicken slices.', price: 389, isVeg: false, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500' },
                { name: 'Garden Veggie Feast Pizza', description: 'Topped with bell peppers, mushrooms, sweet corn, black olives, and cheese.', price: 299, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'BBQ Chicken Pizza', description: 'Zesty BBQ chicken strips, red onions, cilantro, and cheese.', price: 349, isVeg: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
                { name: 'Hawaiian Paradise Pizza', description: 'Marinara sauce, chicken ham, and sweet pineapple chunks with cheese.', price: 329, isVeg: false, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Spicy Jalapeno & Corn Pizza', description: 'Hot jalapeno slices, sweet corn, onion, and red chili flakes with cheese.', price: 279, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Paneer Tikka Pizza', description: 'Spiced paneer tikka chunks, capsicum, onion, and mint drizzle.', price: 319, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Mushroom & Truffle Pizza', description: 'Sautéed wild mushrooms, white sauce base, and drizzle of truffle oil.', price: 359, isVeg: true, image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500' },
                { name: 'Four Cheese Gourmet Pizza', description: 'Creamy blend of mozzarella, cheddar, gorgonzola, and parmesan cheese.', price: 399, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Chicken Keema Pizza', description: 'Spiced minced chicken masala spread topped with melted mozzarella.', price: 369, isVeg: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
                { name: 'Sriracha Hot Honey Pizza', description: 'Spicy sriracha sauce base, cheese, and drizzle of sweet organic honey.', price: 339, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Mediterranean Olives Pizza', description: 'Black and green olives, feta cheese chunks, cherry tomatoes, and basil leaves.', price: 289, isVeg: true, image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500' },
                { name: 'Classic Cheese Pizza', description: 'Simple thin crust loaded with premium Italian mozzarella and marinara sauce.', price: 199, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Tandoori Chicken Pizza', description: 'Spicy tandoori chicken tikka chunks, capsicum, red onion, and mozzarella.', price: 349, isVeg: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
                { name: 'Vegan Mozzarella Pizza', description: 'Wheat crust topped with dairy-free vegan mozzarella cheese and tomatoes.', price: 319, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Tandoori Paneer Pizza', description: 'Cottage cheese pieces marinated in Punjabi tandoori spices and baked on crust.', price: 329, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Chicken Tikka Supreme Pizza', description: 'Roasted chicken chunks, bell peppers, red onions, and hot green chilies.', price: 369, isVeg: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
                { name: 'Spicy Jalapeno and Veg Pizza', description: 'Hot jalapeno slices, red capsicum, sweet corn, and chili flakes with cheese.', price: 289, isVeg: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500' },
                { name: 'Alfredo Chicken Pizza', description: 'Creamy Alfredo white sauce base topped with grilled chicken breast cubes.', price: 349, isVeg: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500' },
                { name: 'Classic Pesto Pizza', description: 'Aromatic basil pesto base topped with cherry tomatoes and fresh mozzarella cheese.', price: 299, isVeg: true, image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500' }
            ],
            'Burgers': [
                { name: 'Veg Maharaja Burger', description: 'Double patty vegetable burger with custom cheese dressing and fresh lettuce.', price: 149, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Chicken Zinger Burger', description: 'Spicy crispy fried chicken breast fillet inside soft toasted sesame buns.', price: 179, isVeg: false, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
                { name: 'Classic Beef Cheese Burger', description: 'Grilled ground beef patty topped with cheddar cheese slice and dill pickles.', price: 199, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Double Decker Crispy Burger', description: 'Two stacked chicken patties, double cheese layers, and signature burger sauce.', price: 229, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Paneer Crisp Burger', description: 'Deep-fried breaded paneer slab topped with spicy chipotle sauce.', price: 169, isVeg: true, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
                { name: 'BBQ Bacon Cheeseburger', description: 'Flame-grilled patty topped with crispy bacon strip, cheese, and sweet BBQ sauce.', price: 249, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Spicy Jalapeno Burger', description: 'Crispy veg patty topped with spicy jalapeno dressing and cheese slice.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Mini Sliders Trio', description: 'Three mini burgers featuring a chicken, beef, and potato patty respectively.', price: 199, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Crispy Fish Fillet Burger', description: 'Crispy fried fish fillet patty topped with tartare sauce and soft lettuce.', price: 219, isVeg: false, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
                { name: 'Black Bean Vegan Burger', description: 'Healthy black bean vegetable patty served on a whole-wheat bun.', price: 179, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Mushroom Swiss Burger', description: 'Grilled patty smothered in sautéed mushrooms and melted Swiss cheese.', price: 209, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Aloo Tikki Street Burger', description: 'Simple potato patty burger dressed with sweet-sour tamarind mint sauce.', price: 89, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Teriyaki Chicken Burger', description: 'Grilled chicken breast glazed in sweet teriyaki glaze sauce.', price: 199, isVeg: false, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
                { name: 'Egg & Cheese Breakfast Burger', description: 'Fried egg, cheddar cheese slice, and garlic mayo in toasted bun.', price: 119, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Avocado Crunch Burger', description: 'Crispy paneer patty topped with fresh avocado slices and cucumber dressing.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'BBQ Pulled Chicken Burger', description: 'Tender shredded chicken cooked in sweet and sticky hickory BBQ sauce.', price: 219, isVeg: false, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
                { name: 'Crispy Potato Patty Burger', description: 'Fried spiced potato cake dressed with green mint chutney and onions.', price: 99, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Smoky Bacon Burger', description: 'Grilled beef patty topped with smoked turkey bacon and cheddar cheese slice.', price: 239, isVeg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
                { name: 'Southern Fried Chicken Burger', description: 'Crispy buttermilk battered fried chicken breast with creamy mayo dressing.', price: 199, isVeg: false, image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500' },
                { name: 'Greek Veggie Burger', description: 'Mediterranean spiced chickpea patty with feta crumbles and tzatziki sauce.', price: 189, isVeg: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' }
            ]
        };

        // Distribute the 160 items evenly among the 6 seeded restaurants
        let itemIndex = 0;
        for (const catName of categoriesList) {
            const catId = categoriesMap[catName];
            const items = menuItemsDataset[catName];

            for (const item of items) {
                const restObj = restaurants[itemIndex % restaurants.length];
                
                foodsData.push({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    isVeg: item.isVeg,
                    category: catId,
                    restaurant: restObj._id,
                    image: item.image
                });

                itemIndex++;
            }
        }

        const seededFoods = await Food.create(foodsData);
        console.log(`Seeded ${seededFoods.length} food items successfully.`);

        console.log('Database Seeding Completed Successfully! 🎉');
        if (shouldExit) {
            process.exit(0);
        }
        return true;
    } catch (err) {
        console.error('Error seeding data:', err);
        if (shouldExit) {
            process.exit(1);
        }
        throw err;
    }
};

if (require.main === module) {
    seedData(true);
} else {
    module.exports = seedData;
}
