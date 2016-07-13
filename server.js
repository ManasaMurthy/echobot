var builder = require('botbuilder');
var restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

intents.matches(/^change mid/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed mid to %s', session.userData.mid);
    }
]);
intents.matches(/^cloudbag/i, [
    function (session, results) {
		var open = require('open');
		open('https://cloudbag.mindtree.com/web/login');
        session.send('cloudbag opened...%s', session.userData.mid);
    }
]);

intents.matches(/^list artifacts/i, [
	function (session) {
        builder.Prompts.text(session, 'Enter cloud provider');
    },
	function (session, results) {
		session.dialogData.cloud = results.response;
		builder.Prompts.text(session, 'Enter cloud service');
		session.dialogData.service = results.response;
		var open = require('open');
		open('http://cloudbagdev.southeastasia.cloudapp.azure.com/rest-cloudbag-service/Artifacts?userId='+session.userData.mid
		+"&cloudProvider="+session.dialogData.cloud +"&cloudService="+session.dialogData.service);
		session.send('Artifacts listed for %s', session.userData.mid);
		session.endDialog();
    }
]);
intents.onDefault([
    function (session, args, next) {
        if (!session.userData.mid) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.mid);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! Enter your MID?');
    },
    function (session, results) {
        session.userData.mid = results.response;
        session.endDialog();
    }
]);
