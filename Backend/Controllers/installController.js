
const installModel = require('../Models/installModel'); 

async function install(req, res, next) {
    try {
            const installMessage = await installModel.install();
            res.status(200).json({ message: 'Installation completed successfully', data: installMessage });
        } catch (error) {
            console.error('Error during installation:', error);
            res.status(500).json({ message: 'Installation failed', error: error.message });
        }
}

module.exports = { 
    install 
}

