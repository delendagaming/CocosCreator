//this is the script that manage the flow and logistic of combat scenes. It shoulb be situated on the root node

var GameAction = require("GameAction");

cc.Class({
    extends: cc.Component,
    properties: {
        FighterPrefab: cc.Prefab
        ,UiMaster: cc.Canvas
        ,FightingArea : cc.Node
        ,ParametersFile : cc.loader.TextAsset 
        ,ActiveFighters : []
        ,CurrentActiveFighter : null
        ,CurrentPlayer : null
        ,Teams : []
        ,turnOrder:[]
        ,file : {
            default : null
            ,type : cc.TextAsset
        }
    },
    onLoad ()
    {
        //create the fighter pool
        this.fighterPool = new cc.NodePool(); //
        let initcount = 4 ;
        for (let i = 0 ; i < initcount ; i++) //instentiate initial pool
        {
            let Fighter = cc.instantiate(this.FighterPrefab);
            this.fighterPool.put(Fighter) ;
        }
        console.log("number of figters in pool, ",this.fighterPool.size());

        this.node.on("TurnState",this.TurnEnded,this) ;
        this.node.on("Destroyed",this.EndFight,this) ;

    },

    start () {
        this.UiMaster = cc.find("Canvas").getComponent("UI_Master");
        this.SetFight();
    }

    ,SetFight() //load and arrange the fighters
    {
        this.AddPlayer();

        let fighters = [0];// parse Current Fighters Setup from the quest;
        
        /*for(let i = 0 ; i < 1 ; i++)
        {
            this.AddFighter(fighters[i]);
            
        }*/
        this.AddFighter()
        this.SetTurns();
    }


    ,BeginFight()
    {
        let player = this.CurrentPlayer;
        this.UiMaster.ChangeDisplayText("fight begin");
        this.UiMaster.DisplayGamesActions(player);
        this.FighterPlay();
    }


    ,EndFight()
    {
        this.node.off("TurnState",this.TurnEnded,this) ;
    }


    ,SetTurns() //set the turn number for every registered fighter
    {
        for(let i = 0 ; i < this.ActiveFighters.length ; i++)
        {
            this.turnOrder.push(this.ActiveFighters[i]);
            this.UiMaster.ChangeDisplayText(this.ActiveFighters[i].DisplayName + ' play in ' + i.toString())
        }

    }


    ,NextTurn() //set the next action
    {
        cc.log('next turn', this.turnOrder[0] );
        let fighter = this.turnOrder.shift(); //take the first fighter from the pile
        this.turnOrder.push(fighter); //put it last
        cc.log
        this.turnOrder[0].getComponent('FighterScript').BeginTurn() ;
    }


    ,TurnEnded(event)
    {
        cc.log(this.ActiveFighters.length , ' figthers still active') ;
        //if(this.ActiveFighters.length == 0 || event.detail == 'End'){this.EndFight()};
        if(event.detail == 'End'){this.NextTurn()}
    },


    LoadFighter(fightername){
        //get file

    },

    SetFighter(fighterStats)//load and set a fighter using its initials stats
    {
        let fighter ;
        if(this.fighterPool.size() > 0){fighter = this.fighterPool.get() ;}
        else{ fighter = cc.instantiate(this.FighterPrefab) }
        

        //fighter.init() ;
        return fighter ;
    }

    ,RemoveFighter(event)
    {
        
    }

    ,AddFighter(fighterStats) //take a fighter from the pool and add to the designed node
    {
        let temp = this.SetFighter() ;
        this.FightingArea.addChild(temp , 1 ) ; //add to the designated node
        this.ActiveFighters.push(temp); //register as active fighter
        temp.getComponent('FighterScript').DisplayName += this.ActiveFighters.length.toString();
        
        this.UiMaster.ChangeDisplayText(temp.getComponent('FighterScript').DisplayName + " has joined the fight")

        return temp ;
        //fighter.init();
    }


    ,AddPlayer() //Set the player fighter
    {
        let player = this.AddFighter() ;
        
        player.getComponent('FighterScript').DisplayName = 'player ';
        player.getComponent('FighterScript').isPlayer = true ;
        player.color = cc.Color.GREEN ;
        //player.opacity = 0 ;
        player.getComponent('FighterScript').Team = 1;
        this.CurrentPlayer = player ;
        this.UiMaster.ChangeDisplayText('player is added to the fight') ;

    }


    ,SetPlayerActions() //show the actions possibles to the screen
    {

    }


    ,FighterPlay(){ //tell this fighter it's it's turn

        this.ActiveFighters[0].getComponent('FighterScript').BeginTurn() ;
        this.CurrentActiveFighter = this.ActiveFighters[0];
    }
    // update (dt) {},

});
