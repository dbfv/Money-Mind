const mongoose = require('mongoose');
const SixJarsProfile = require('../api/sixJarsProfiles/sixJarsProfile.model');
const EconomicAssumption = require('../api/economicAssumptions/economicAssumption.model');
const { connectDB } = require('../config/db');

const presetProfiles = [
    {
        name: 'Standard Budget',
        description: 'The classic 6 Jars method with standard percentages',
        isPreset: true,
        jarPercentages: {
            necessities: 55,
            play: 10,
            education: 10,
            financialFreedom: 10,
            longTermSavings: 10,
            give: 5,
        },
    },
    {
        name: 'Conservative Saver',
        description: 'Higher focus on necessities and long-term savings',
        isPreset: true,
        jarPercentages: {
            necessities: 60,
            play: 5,
            education: 10,
            financialFreedom: 10,
            longTermSavings: 12,
            give: 3,
        },
    },
    {
        name: 'Balanced Lifestyle',
        description: 'Balanced approach with moderate play and education',
        isPreset: true,
        jarPercentages: {
            necessities: 50,
            play: 15,
            education: 15,
            financialFreedom: 10,
            longTermSavings: 8,
            give: 2,
        },
    },
    {
        name: 'Education Focus',
        description: 'Higher emphasis on education and personal development',
        isPreset: true,
        jarPercentages: {
            necessities: 55,
            play: 8,
            education: 20,
            financialFreedom: 8,
            longTermSavings: 7,
            give: 2,
        },
    },
    {
        name: 'Financial Freedom Focus',
        description: 'Higher emphasis on building financial freedom',
        isPreset: true,
        jarPercentages: {
            necessities: 50,
            play: 8,
            education: 10,
            financialFreedom: 20,
            longTermSavings: 10,
            give: 2,
        },
    },
    {
        name: 'Generous Giver',
        description: 'Higher emphasis on giving and charity',
        isPreset: true,
        jarPercentages: {
            necessities: 55,
            play: 8,
            education: 10,
            financialFreedom: 10,
            longTermSavings: 7,
            give: 10,
        },
    },
];

const defaultEconomicAssumptions = {
    inflationRate: 2.0,
    bankInterestRate: 1.0,
    marketReturnRate: 7.0,
    taxRate: 20.0,
    isActive: true,
};

async function seedData() {
    try {
        await connectDB();

        console.log('Seeding six jars profiles...');

        // Clear existing preset profiles
        await SixJarsProfile.deleteMany({ isPreset: true });

        // Insert preset profiles
        const createdProfiles = await SixJarsProfile.insertMany(presetProfiles);
        console.log(`Created ${createdProfiles.length} preset profiles`);

        // Create default economic assumptions if none exist
        const existingAssumptions = await EconomicAssumption.findOne({ isActive: true });
        if (!existingAssumptions) {
            const economicAssumptions = new EconomicAssumption(defaultEconomicAssumptions);
            await economicAssumptions.save();
            console.log('Created default economic assumptions');
        } else {
            console.log('Economic assumptions already exist');
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData(); 