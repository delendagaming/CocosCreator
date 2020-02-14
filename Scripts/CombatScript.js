//this is the script that manage the flow and logistic of combat scenes. It shoulb be situated on the root node

//var GameAction = require("GameAction");
var GameEffect = require("GameEffect");
var FighterClass = require('FighterScript');
var PlayerClass = require('Player');

cc.Class({
    extends: cc.Component,
    properties: {
        FighterPrefab: cc.Prefab,
        parametersFile : cc.loader.TextAsset ,

        //gameplay
        aActivesFighters : [],
        isVictory : {
            default : false,
            visible : false,
        },
        nFightersAlives : {
            default : 0,
            visible : false,
        },
        currentTurn : {
            default : 0,
            visible : false,
        },
        currentPlayer : {
            default : null,
            visible : false,
        },
        currentPage : {
            default : 'default',
            visible : false,
        },
        turnOrder:{
            default : [],
            visible : false,
        },
        file : {
            default : null,
            type : cc.TextAsset
        },
        isWaitingPlayerChoice: {
            default : false,
            visible : false,
        },
        choicesValidated : {
            default : 0,
            visible : false,
        },
        activesEffects: {
            default : [],
            visible : false,
        },

        journal : cc.Node,
        journalentryPrefab : cc.Prefab,

        //Display
        buttons : [] ,
        fightersArea : cc.Node ,
        buttonsLayout : cc.Layout,
        buttonPrefab : cc.Prefab ,
        playerHealthBar : cc.ProgressBar ,
        monsterHealthBar : cc.ProgressBar,

    },
    onLoad ()
    {
        if(this.buttonPrefab){
            for(let i =0; i<5;i++){
                this.buttons.push(cc.instantiate(this.buttonPrefab));

            }
        }
        this.node.on("TurnEvent",this.TurnEnded,this) ;
        this.node.on("Destroyed",this.RemoveFighter,this) ;
        this.node.on("Choice",this.ReceiveChoiceEvent,this);
        
    },

    start () {
        this.UIMaster = cc.find("Canvas").getComponent("QuestScript");
    }

    ,SetPageFight(page) //register the fighters from the given page
    {
        this.AddPlayer();
        let index = 0 ; //index is the fighter position in currentMonsters array
        cc.log('setting fight');
        this.aActivesFighters.push(this.currentPlayer); //the player scirpt is registered first
        this.currentPlayer.index = index;
        for (let monster of page.currentMonsters){
            index ++;
            monster.getComponent('FighterScript').index = index ;
            this.aActivesFighters.push(monster.getComponent('FighterScript')); //the monsters scripts are registered then
        };
        this.nFightersAlives = index + 1;

        this.showFighters(this.aActivesFighters);
        //this.SetTurns();
        this.BeginRound();
    },

    CleanUp(){
        this.currentPage = null ;
        this.currentPlayer = null;
        this.currentMonsters = null ;
        this.currentTurn = null ;
        this.aActivesFighters = [];
        this.turnOrder=[];
        this.activesEffects = [];
        this.isVictory = false;
        for(let button of this.buttons){
            button.parent = null;
            cc.loader.release(button);
        }
    },

    showFighters(fighters){
        cc.log('showing fighter');
        if(this.fightersArea){
            for(let fighter of fighters){
                cc.log(fighter.displayNode.active,'test parent')
                fighter.displayNode.parent = this.fightersArea;
                fighter.displayNode.active = true ;
                cc.log(fighter.displayNode.active,'test parent')
            }
        }
    },

    endFight(isVictory){
        cc.log("fight end");
        this.node.off("TurnEvent",this.TurnEnded,this) ;  
        this.node.emit('endOfFight',isVictory);
        this.CleanUp();

        return isVictory;
    },

    BeginRound(){
        this.choicesValidated = 0 ;
        this.currentTurn = 0;
        this.BeginTurn();
    },

    EndRound(){
        cc.log('Round end ' , this.activesEffects.length , this.nFightersAlives);
        var nextEffectArray = new Array();
        for(let i = 0 ; i < this.activesEffects.length;i++)
        {
            this.ExecuteEffect(this.activesEffects[i]);
            if(this.activesEffects[i].duration > 0){nextEffectArray.push(this.activesEffects[i])}
        }
        this.activesEffects = nextEffectArray ;
        cc.log('checking for survivors');

        //for now the victory condition is just last man standing
        if(this.nFightersAlives <2){
            let isVictory = false ;
            if(this.currentPlayer.characteristics.healthPoints > 0){isVictory = true};
            this.endFight(isVictory);
            return 0;
        }
        this.BeginRound();
    },

    BeginRound(){
        cc.log('Round begin');
        this.currentTurn = 0;
        for (let i = 0 ; i<this.activesEffects.length;i++){
            this.ExecuteEffect(i)
        }
        this.BeginTurn();
        
        
    },

    BeginTurn(){
        cc.log('begin turn ',this.currentTurn , this.aActivesFighters[this.currentTurn].displayName);
        this.ChooseTarget(this.currentTurn);
        this.chooseAction(this.currentTurn);

    },

    EndTurn(){
        cc.log('ending turn ',this.currentTurn )
        if(this.currentTurn + 1 >= this.aActivesFighters.length){
            this.EndRound();
        }
        else{
            this.currentTurn ++
            this.BeginTurn();
        }
        
    },

    RemoveFighter(fighterScript){
        cc.log('removing ',fighterScript);
        fighterScript.node.active = false ;
        this.nFightersAlives --;
        //this.aActivesFighters.splice(fighterScript.index,1) ;//remove the fighter at the designed index
    },

    AddFighter(template){
        //add a fighter to a page, completely independant of combat
        cc.log('adding monster ',template);
        var prefab = cc.instantiate(this.FighterPrefab);
        var fighterScript = prefab.getComponent('FighterScript');
        fighterScript.displayNode.active = false ;

        if(template.hasOwnProperty('image')){
            cc.loader.load({url:template.image,type:'png'}, function (err, texture) {
                if(err){
                    cc.log('texture not loading for ',page.id,' : ',err.message);
                };
                if(texture){
                    fighterScript.loadedImage = texture;
                    prefab.getComponent(cc.Sprite).spriteFrame  = new cc.SpriteFrame(texture);
                };
            });
        }
        //if(this.fightersArea){this.fightersArea.addChild(fighterScript.displayNode)};
        
        prefab.setPosition(template.top , template.left);
        
        this.InitFighter(fighterScript,template.characteristics);
        //prefab.currentPage = page.index ;
        return fighterScript;
    },

    AddPlayer() //Set the player fighter
    {
        let player = cc.instantiate(this.FighterPrefab);
        let playerScript = player.getComponent('FighterScript') ;
        //stats here are temporary
        var stats = {
            attackPoints: 30,
            defensePoints: 15,
            healthPoints: 45,
            isSelected: false,
            name: "player"
        };
        this.InitFighter(playerScript,stats);
        playerScript.displayName = 'player ';
        playerScript.isPlayer = true ;
        playerScript.Team = 1;
        //player.getChildByName('InfoDisplay').getComponent('UI_Info').Refresh();

        player.color = cc.Color.GREEN ;
        player.scale = 0;
        player.parent = this.fightersArea;
        //player.opacity = 0 ;
        this.currentPlayer = playerScript ;
    },

    InitFighter(fighterScript ,characteristics){
        cc.log('initialize fighter' ,fighterScript,fighterScript.name);
        fighterScript['characteristics'] = new Object();

        for (let attribute in characteristics)
        {
            let baseAttribute = 'base '+attribute ;
            fighterScript.characteristics[baseAttribute] = characteristics[attribute];
            fighterScript.characteristics[attribute] = characteristics[attribute];
            cc.log(attribute ,' : ',fighterScript.characteristics[attribute]);
        };

        cc.log('itialising json actions',fighterScript.jsonActions);
        for(var action in fighterScript.jsonActions.json)
        {
            fighterScript.possiblesActions.push(fighterScript.jsonActions.json[action]);
            cc.log(fighterScript.jsonActions.json[action].name ,' initialized');
        }

        cc.log(fighterScript.characteristics.name ,' initialized');
        return fighterScript ;
    },

    ChooseTarget(fighterIndex){
        var fighterScript = this.aActivesFighters[fighterIndex] ;
        //this is temporary
        cc.log('choosing target',fighterIndex);
        if(this.aActivesFighters.length < 2){
            fighterScript.target = this.aActivesFighters[1];
        }
        //else {}; for now only one target is possible

    },


    ReceiveChoiceEvent(event) //trigger when the player click on an action button
    {
        cc.log(this.name,' received choice event ');
        cc.log('action');
        this.isWaitingPlayerChoice = false ;
        
        this.executeAction(this.currentPlayer.index,this.currentPlayer.possiblesActions[event.choiceNumber].name,1);
    },

    chooseAction(fighterIndex){
        cc.log('choosing action');
        var fighterScript = this.aActivesFighters[fighterIndex] ;
        if(fighterScript.isPlayer){
            this.isWaitingPlayerChoice = true ; 
            this.showActions( fighterScript.possiblesActions);
            //this.UIMaster.SetChoices(this.UIMaster.currentPage , fighterScript.possiblesActions);
        }
        else{
            // the monster ai
            cc.log('monster is playing');
            var bestActionWeight = 0;
            var bestActionIndex = 0;
            var targetIndex ;
            var actionWeight = 0 ;
            for(var i = 0 ; i < fighterScript.possiblesActions.length;i++){ //for each action possible
                
                for(var j = 0 ; j < this.aActivesFighters.length;j++){ //and each target possible
                    //cc.log('test weighting action',fighterScript.characteristics.name , fighterScript.possiblesActions[i].name,this.aActivesFighters[j].characteristics.name);
                    actionWeight = this.weighAction(fighterScript.index , fighterScript.possiblesActions[i].name, j) ;//weigh the effect of the action
                    
                    if(actionWeight > bestActionWeight){
                        bestActionIndex = i;
                        bestActionWeight = actionWeight;
                        targetIndex = j ;
                    }
                } 
            };
            this.executeAction( fighterScript.index , fighterScript.possiblesActions[bestActionIndex].name, targetIndex);
        };
    },

    showActions(actions){
        cc.log('showing actions ',actions)
        for (let i = 0 ; i < this.buttons.length ; i++){
            if(i < actions.length){
                cc.log('showing action',actions[i].name)
                this.buttons[i].parent = this.buttonsLayout.node ;
                this.buttons[i].active = true ;
                this.buttons[i].getComponent('TestButton').choiceNumber = i;
                cc.find('Label',this.buttons[i]).getComponent(cc.Label).string = actions[i].name ;
                this.buttons[i].on('click',this.ReceiveChoiceEvent,this) ;
            }
            else{
                this.buttons[i].active = false ;
            }
        };

    },

    hideActions(){
        for (let i = 0 ; i < this.buttons.length ; i++){
            this.buttons[i].active = false ; 
        };

    },

    refreshInfos(){

    },

    executeAction(initiaterIndex,actionName,targetIndex){
        var initiater = this.aActivesFighters[initiaterIndex];

        cc.log(initiater.displayName ,' executing action',actionName,initiaterIndex,targetIndex);
        for (var i = 0; i< initiater.possiblesActions.length;i++)
        {
            cc.log(initiater.possiblesActions[i].name);
            if(initiater.possiblesActions[i].name == actionName){
                let effect = new GameEffect();
                let action = initiater.possiblesActions[i];
                cc.log('creating effect ',initiater.possiblesActions[i].name , action.baseAttribute);
                effect.name = action.name;
                effect.calculationType = action.calculationType;
                effect.attributeTargeted = action.attributeTargeted;
                effect.description = action.description;
                effect.isPermanent = action.isPermanent;
                effect.finalMagnitude = (action.preFlatAddition + initiater.characteristics[action.baseAttribute]) * action.attributeMagnitude + action.postFlatAddition;;
                effect.duration = action.duration ;
                cc.log('magnitude ',effect.finalMagnitude);
                effect.initiaterIndex = initiaterIndex;
                effect.targetIndex = targetIndex;

                if(effect.duration == 0){this.ExecuteEffect(effect)}
                else{
                    this.activesEffects.push(effect);
                    cc.log(this.activesEffects.length,' current effects targetting ',effect.targetIndex);
                }
            };
        }
        //check if all fighters have played
        this.choicesValidated ++;
        this.EndTurn();
    },
    // update (dt) {},

    weighAction(initiaterIndex,actionName,targetIndex){
        
        var worth = 0;
        var totalPower = 0;
        var multiplier = -1 ;
        var initiater = this.aActivesFighters[initiaterIndex];
        cc.log('test wheighting action', initiater.possiblesActions);
        var target = this.aActivesFighters[targetIndex];
        
        for (var i = 0; i< initiater.possiblesActions.length;i++)
        {
            var action = initiater.possiblesActions[i];
            if(action.name == actionName && action.isPermanent){
                
                if(this.isEffectActive(actionName,targetIndex)){return 0} //if the effect is alrady present no need to reapply it
                
                if(action.target == 'Self'){multiplier = 1}; //if self targetting the weight of damage/healing in inversed
                worth = multiplier * ( (action.preFlatAddition + initiater.characteristics[action.baseAttribute]) * action.attributeMagnitude + action.postFlatAddition) * (action.duration+1);
                //if(worth > target.characteristics[attributeTargeted]){worth = target.characteristics[attributeTargeted]} ;
            };
        };
        //check if all fighters have played
        cc.log('test wheighting action end', worth);
        return worth ;

    },

    ExecuteEffect(effect)
    {
        var effectEvent = new cc.Event.EventCustom('Effect',true);
        cc.log(effect.initiaterIndex ,' executing effect on ',effect.targetIndex,this.aActivesFighters[effect.targetIndex]);
        var target = this.aActivesFighters[effect.targetIndex];
        var initiater = this.aActivesFighters[effect.initiaterIndex];
        
        if(effect.isPermanent)
        {
            
            target.characteristics[effect.attributeTargeted] += effect.finalMagnitude;
            cc.log(target.characteristics[effect.attributeTargeted] , ' : new value for ',effect.attributeTargeted);

            effectEvent.detail = effect ;
            
            this.aActivesFighters[effect.targetIndex].node.dispatchEvent(effectEvent);
            //effect.target.ReceiveEffect();

            if(target.characteristics.healthPoints <= 0){this.RemoveFighter(target)};
        }
    },

    isSameTeam(fighterIndex1, fighterIndex2){
        return (this.aActivesFighters[fighterIndex1] == this.aActivesFighters[fighterIndex2])
    },

    isEffectActive(effectName , targetIndex){
        var isActive = false;
        for(let i = 0 ; i < this.activesEffects ; i++){
            if(this.activesEffects[i].name == effectName && this.activesEffects[i].targetIndex == targetIndex){isActive = true ;};
        }
        return isActive ;
    },

    getFighterEffects(fighterIndex){
        let effectList = new Array();
        for(let i = 0 ; i < this.activesEffects ; i++){
            if(this.activesEffects[i].targetIndex == fighterIndex ){effectList.push(this.activesEffects[i])};
        }
        return effectList ;
    },

    getAction(actionlist ,actionName){
        for(let i = 0 ; i<actionlist.length ;i++){
            if(actionlist[i].name == actionName){return actionlist[i]}
        }
    },

    addToJournal(){
        if(this.journal)

    },

    test(){
        cc.log('combat text');
    }

});
