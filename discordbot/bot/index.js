// Require the necessary discord.js classes
const { Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const {token}= require('../../config.json');
const {TicTacToe}=require('./databaseObject.js');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS,Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('messageCreate',(message)=>{
    //blocks bot from responding to itself
    if(message.author.id === client.user.id) return;

    if(message.content === "ping"){
        message.reply("pong");
    }
})

/* Tic Tac Toe */
let EMPTY= Symbol("empty");
let PLAYER= Symbol("player");
let BOT= Symbol("bot");
let tictactoe_state

function makeGrid()
{
   
    components = []

    for(let row=0;row<3;row++)
    {
        actionRow=new MessageActionRow()
        for(let col=0;col<3;col++)
        {
            messageButton= new MessageButton()
                .setCustomId('tictactoe_'+ row+ '_'+col)
            

            switch(tictactoe_state[row][col]){
                case EMPTY:
                    messageButton
                        .setLabel(' ')
                        .setStyle('SECONDARY')
                    break;
                case PLAYER:
                    messageButton
                        .setLabel('X')
                        .setStyle('PRIMARY')
                    break;
                case BOT:
                    messageButton
                        .setLabel('O')
                        .setStyle('DANGER')
                    break;
                
                
            }    
            actionRow.addComponents(messageButton)
        }
        components.push(actionRow)
    }
    return components
}

client.on('interactionCreate',async interaction =>{
    if(!interaction.isCommand()) return;

    const {commandName} = interaction;
    if (commandName === 'tictactoe'){
        
        tictactoe_state =[
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY],
            [EMPTY, EMPTY, EMPTY]
        ]
        await interaction.reply({content: 'Playing a game of tic-tac-toe!',components:makeGrid()});
    }
})

function getRandomInt(max){
    return Math.floor(Math.random()*max);
}

function isDraw(){
    for (let row=0; row<3;row++){
        for (let col=0;col<3;col++){
            if(tictactoe_state[row][col] == EMPTY)
            {
                return false;
            }
        }
    }
    return true;
}

function isGameOver(){
    for (let i=0; i<3;i++){
        if(tictactoe_state[i][0] === tictactoe_state[i][1] && tictactoe_state[i][1] === tictactoe_state[i][2] && tictactoe_state[i][2] != EMPTY){
            return true;
        }
        if(tictactoe_state[0][i]===tictactoe_state[1][i] && tictactoe_state[1][i]=== tictactoe_state[2][i] && tictactoe_state[2][i] != EMPTY){
            return true;
        }
    }

    if(tictactoe_state[1][1] != EMPTY)
    {
        if((tictactoe_state[0][0]===tictactoe_state[1][1] && tictactoe_state[1][1]=== tictactoe_state[2][2]) || (tictactoe_state[2][0]===tictactoe_state[1][1] && tictactoe_state[1][1]===tictactoe_state[0][2])){
            return true;
        }
    }

    return false;
}

client.on('interactionCreate',async interaction =>{
    if(!interaction.isButton()) return;
    if(!interaction.customId.startsWith('tictactoe')) return;

    if(isGameOver()){
        interaction.update({
            components:makeGrid()
    
        })
        return;
    }
  
    parsedFields=interaction.customId.split("_")
    row=parsedFields[1]
    col=parsedFields[2]

    if(tictactoe_state[row][col]!= EMPTY)
    {
        interaction.update({
            content: "You can't select that position!",
            components:makeGrid()
    
        })
        return;
    }

    tictactoe_state[row][col]=PLAYER
   

    if(isGameOver()){
        let user=await TicTacToe.findOne({
            where:{
                user_id: interaction.user.id
            }
        });
        //creates a new row for new users
        if(!user){
            user = await TicTacToe.create({user_id: interaction.user.id});
        }
        //increments score column
        await user.increment('score');
        interaction.update({
            content: "You won the game of tic-tac-toe! You have now won "+ (user.get('score')+1)+" times",
            components:[]
    
        })
        return;
    }
    if(isDraw()){
        interaction.update({
            content: "The game resulted in a draw!",
            components:[]
    
        })
        return;
    }

    
    /*Bot Functionality*/
    let botRow;
    let botCol;
    do{
        botRow = getRandomInt(3)
        botCol = getRandomInt(3)

    }while(tictactoe_state[botRow][botCol]!=EMPTY);

    tictactoe_state[botRow][botCol]= BOT;
   
   

    if(isGameOver()){
        interaction.update({
            content: "You lost the game of tic-tac-toe!",
            components:[]
    
        })
        return;
    }
    if(isDraw()){
        interaction.update({
            content: "The game resulted in a draw!",
            components:[]
    
        })
        return;
    }

    interaction.update({
        components:makeGrid()

    })
})



















// Login to Discord with your client's token

client.login(token);