
const cron = require('node-cron');
const topicsController = require('../controllers/topicsController');


const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');

  // Refresh topics every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log(' Auto-refreshing weekly topics...');
    
    try {
      const req = {};
      const res = {
        json: (data) => {
          if (data.success) {
            console.log(' Topics refreshed successfully');
            console.log(`   - Topics count: ${data.data.length}`);
          } else {
            console.error('Topics refresh failed');
          }
        },
        status: () => res
      };
      
      await topicsController.refreshTopics(req, res);
    } catch (error) {
      console.error(' Error in auto-refresh:', error);
    }
  }, {
    timezone: "Africa/Nairobi"
  });

  console.log('Cron job scheduled: Topics refresh every 6 hours');
};

module.exports = { initializeCronJobs };