const WhatsAppSession = require('../models/whatsapp');
const Center = require('../models/centers');
const QueueReport = require('../models/queuereport');
const Analytics = require('../models/analytics');

const verifyWebhook = (req, res) => {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'niko_kadi_2026';
  
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token === VERIFY_TOKEN) {
    console.log(' WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('WhatsApp webhook verification failed');
    res.sendStatus(403);
  }
};

// WhatsApp webhook - receive messages
const receiveMessage = async (req, res) => {
  try {
    res.sendStatus(200);
    
    const { entry } = req.body;
    
    if (!entry || !entry[0]) return;
    
    const changes = entry[0].changes;
    if (!changes || !changes[0]) return;
    
    const value = changes[0].value;
    if (!value.messages || value.messages.length === 0) return;
    
    const message = value.messages[0];
    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;
    const location = message.location; // If user shares location
    
    console.log(`📱 Received WhatsApp message from ${phoneNumber}: ${messageText}`);
    
    // Process the message
    await handleWhatsAppMessage({
      phoneNumber,
      messageText,
      messageId,
      location
    });
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
  }
};

// Handle incoming WhatsApp messages
async function handleWhatsAppMessage({ phoneNumber, messageText, messageId, location }) {
  try {
    // Get or create session
    const session = await WhatsAppSession.getOrCreate(phoneNumber);
    await session.updateActivity();
    
    // Track analytics
    await Analytics.create({
      eventType: 'whatsapp_command',
      source: 'whatsapp',
      sessionId: session._id.toString(),
      whatsappData: {
        phoneNumber: phoneNumber,
        messageId: messageId,
        command: messageText.toLowerCase().trim()
      }
    });
    
    const command = messageText.toLowerCase().trim();
    
    // Handle location sharing
    if (location) {
      await handleLocationMessage(session, location, phoneNumber);
      return;
    }
    
    // Handle text commands
    switch (session.state) {
      case 'initial':
      case 'main_menu':
        await handleMainMenu(session, command, phoneNumber);
        break;
        
      case 'awaiting_location':
        await sendMessage(phoneNumber, 
          " *Please share your location*\n\n" +
          "To find IEBC centers near you:\n" +
          "1. Tap the  (attach) button\n" +
          "2. Select *Location*\n" +
          "3. Choose *Send your current location*"
        );
        break;
        
      case 'center_selected':
        await handleCenterActions(session, command, phoneNumber);
        break;
        
      case 'awaiting_queue_status':
        await handleQueueStatusInput(session, command, phoneNumber);
        break;
        
      case 'awaiting_id_number':
        await handleIDVerification(session, command, phoneNumber);
        break;
        
      default:
        await handleMainMenu(session, command, phoneNumber);
    }
    
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    await sendMessage(phoneNumber, 
      "Sorry, something went wrong. Type *menu* to start again."
    );
  }
}


async function handleMainMenu(session, command, phoneNumber) {
  if (command === 'menu' || command === 'start' || command === 'hi' || command === 'hello' || command === 'hey') {
    await session.setState('main_menu');
    await sendMessage(phoneNumber,
      "*Welcome to Niko Kadi! 🇰🇪*\n\n" +
      "Your voter registration assistant.\n\n" +
      "*Choose an option:*\n\n" +
      "1 Find IEBC Centers Near Me\n" +
      "2 Check Queue Status\n" +
      "3 Report Queue Time\n" +
      "4 Verify Registration Status\n" +
      "5 Help\n\n" +
      "Reply with a number (1-5) or type:\n" +
      "• *centers* - Find centers\n" +
      "• *queue* - Check queues\n" +
      "• *report* - Report queue\n" +
      "• *status* - Verify registration"
    );
    
  } else if (command === '1' || command === 'centers' || command.includes('find') || command.includes('location')) {
    await session.setState('awaiting_location');
    await sendMessage(phoneNumber,
      "*Find IEBC Centers*\n\n" +
      "Share your location to find the nearest centers.\n\n" +
      "*How to share location:*\n" +
      "1. Tap the button below\n" +
      "2. Select *Location*\n" +
      "3. Tap *Send your current location*"
    );
    
  } else if (command === '4' || command === 'status' || command === 'verify' || command.includes('registration')) {
    await session.setState('awaiting_id_number');
    await sendMessage(phoneNumber,
      "🔍 *Verify Registration Status*\n\n" +
      "Please send your National ID number to check if you're registered.\n\n" +
      "*Example:* 12345678"
    );
    
  } else if (command === '5' || command === 'help') {
    await sendMessage(phoneNumber,
      "*Niko Kadi Help* 📖\n\n" +
      "*What we do:*\n" +
      "Find IEBC centers near you\n" +
      "Show real-time queue status\n" +
      "Help you report queue times\n" +
      "Verify voter registration\n\n" +
      "*How to use:*\n" +
      "Type *menu* anytime to see options\n\n" +
      "*Need human help?*\n" +
      " Call IEBC: 020 2877000\n\n" +
      "Type *menu* to return to main menu"
    );
    
  } else {
    await sendMessage(phoneNumber,
      "I didn't understand that command.\n\n" +
      "Type *menu* to see all available options."
    );
  }
}

// Handle location messages
async function handleLocationMessage(session, location, phoneNumber) {
  const { latitude, longitude } = location;
  
  await session.setState('finding_centers', {
    userLocation: { lat: latitude, lng: longitude }
  });
  
  await sendMessage(phoneNumber, "🔍 Searching for IEBC centers near you...");
  
  // Find nearby centers
  const nearbyCenters = await Center.findNearby(latitude, longitude, 10);
  
  if (nearbyCenters.length === 0) {
    await sendMessage(phoneNumber,
      "*No IEBC centers found*\n\n" +
      "No centers found within 10km of your location.\n\n" +
      "Type *menu* to try again or call IEBC at 020 2877000"
    );
    await session.setState('main_menu');
    return;
  }
  
  // Save nearby centers to session
  await session.setState('center_selected', {
    userLocation: { lat: latitude, lng: longitude },
    nearbyCenters: nearbyCenters.slice(0, 5).map(c => ({
      centerId: c._id,
      distance: c.distance
    }))
  });
  
  // Format and send centers
  let message = `*Nearest IEBC Centers*\n\n`;
  
  nearbyCenters.slice(0, 5).forEach((center, index) => {
    message += `*${index + 1}. ${center.name}*\n`;
    message += ` ${center.distanceText} away\n`;
    message += ` ${center.location}\n`;
    message += ` ${center.currentQueue.status}\n`;
    message += `  Wait: ~${center.currentQueue.waitTime} min\n\n`;
  });
  
  message += `Reply with a number (1-5) to view details\n`;
  message += `Type *menu* to return to main menu`;
  
  await sendMessage(phoneNumber, message);
  
  session.actionsPerformed.centersViewed += 1;
  await session.save();
}

// Handle ID verification
async function handleIDVerification(session, idNumber, phoneNumber) {
  if (!idNumber || idNumber.length < 6 || !/^\d+$/.test(idNumber)) {
    await sendMessage(phoneNumber,
      " *Invalid ID Number*\n\n" +
      "Please send a valid ID number:\n" +
      "Only numbers\n" +
      "At least 6 digits\n\n" +
      "*Example:* 12345678"
    );
    return;
  }
  
  await sendMessage(phoneNumber, " Checking registration status...");
  
  // Call IEBC verification endpoint
  const axios = require('axios');
  try {
    const apiUrl = process.env.API_URL || 'http://localhost:5000';
    const response = await axios.post(`${apiUrl}/api/iebc/verify`, {
      idNumber: idNumber,
      source: 'whatsapp',
      whatsappData: {
        phoneNumber: phoneNumber
      }
    });
    
    if (response.data.registered) {
      const data = response.data.data;
      await sendMessage(phoneNumber,
        `*Registration Found!*\n\n` +
        `*Name:* ${data.name}\n` +
        `*ID:* ${data.idNumber}\n` +
        `*County:* ${data.county}\n` +
        `*Constituency:* ${data.constituency}\n` +
        `*Polling Station:* ${data.pollingStation}\n\n` +
        `You're all set for the 2027 elections!\n\n` +
        `Type *menu* for more options`
      );
    } else {
      await sendMessage(phoneNumber,
        `Not Registered*\n\n` +
        `No registration found for ID: ${idNumber}\n\n` +
        `Please register at your nearest IEBC office*\n\n` +
        `IEBC Helpline: 020 2877000\n\n` +
        `Type *centers* to find offices near you`
      );
    }
    
    session.actionsPerformed.statusChecked += 1;
    await session.setState('main_menu');
    
  } catch (error) {
    console.error('Verification error:', error);
    await sendMessage(phoneNumber,
      "*Service Temporarily Unavailable*\n\n" +
      "We couldn't verify your registration right now.\n\n" +
      "Please try again in a few minutes or call:\n" +
      "IEBC: 020 2877000\n\n" +
      "Type *menu* to return"
    );
    await session.setState('main_menu');
  }
}

// Handle center actions
async function handleCenterActions(session, command, phoneNumber) {
  if (/^[1-5]$/.test(command)) {
    const centerIndex = parseInt(command) - 1;
    const selectedCenter = session.context.nearbyCenters[centerIndex];
    
    if (!selectedCenter) {
      await sendMessage(phoneNumber, 
        "Invalid selection. Please choose a number from 1-5.\n\n" +
        "Type *menu* to start over"
      );
      return;
    }
    
    const center = await Center.findById(selectedCenter.centerId);
    
    await sendMessage(phoneNumber,
      `*${center.name}*\n\n` +
      `*Location:* ${center.location}\n` +
      `*Distance:* ${selectedCenter.distance.toFixed(1)}km away\n` +
      ` *Constituency:* ${center.constituency}\n\n` +
      `*Queue Status:*\n` +
      `${center.currentQueue.status}\n` +
      `Wait Time: ~${center.currentQueue.waitTime} min\n` +
      `Working Hours: ${center.workingHours}\n\n` +
      `Type *report* to submit a queue report\n` +
      `Type *menu* to go back`
    );
    
    await session.setState('center_selected', {
      ...session.context,
      selectedCenterId: center._id
    });
  } else if (command === 'menu') {
    await session.setState('main_menu');
    await handleMainMenu(session, 'menu', phoneNumber);
  }
}

// Send WhatsApp message
async function sendMessage(phoneNumber, message) {
  // TODO: Integrate with WhatsApp Business API (Meta/Twilio)
  
  /* META WHATSAPP BUSINESS API (uncomment when ready):
  
  const axios = require('axios');
  
  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Message sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
  
  */
  
  /* TWILIO WHATSAPP API (alternative):
  
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${phoneNumber}`,
      body: message
    });
    console.log(`✅ Message sent to ${phoneNumber}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
  
  */
  
  // MOCK (for development)
  console.log(`\n WhatsApp Message to ${phoneNumber}:`);
  console.log('─'.repeat(50));
  console.log(message);
  console.log('─'.repeat(50));
}

// Get WhatsApp session statistics
const getSessionStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const stats = await WhatsAppSession.getSessionStats(days);
    
    res.json({
      success: true,
      period: `Last ${days} days`,
      data: stats
    });
  } catch (error) {
    console.error('Error in getSessionStats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  verifyWebhook,
  receiveMessage,
  getSessionStats
};