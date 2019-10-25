//this is the script that manage the flow and logistic of combat scenes. It shoulb be situated on the root node

//var GameAction = require("GameAction");
var GameEffect = require("GameEffect");

cc.Class({
    extends: cc.Component,
    properties: {
        FighterPrefab: cc.Prefab
        ,UIMaster: cc.Node
        ,parametersFile : cc.loader.TextAsset 
        ,activesFighters : []
        ,isVictory : false
        ,alivesFighters : 0
        ,currentTurn : 0
        ,currentPlayer : null
        ,currentPage : 'default'
        ,turnOrder:[]
        ,file : {
            default : null
            ,type : cc.TextAsset
        },
        isWaitingPlayerChoice: false,
        choicesValidated : 0,

        activesEffects: []
    },
    onLoad ()
    {
        this.node.on("TurnEvent",this.TurnEnded,this) ;
        this.node.on("Destroyed",this.RemoveFighter,this) ;
        this.node.on("Choice",this.ReceiveChoiceEvent,this);
        
    },

    start () {
        this.UIMaster = cc.find("Canvas").getComponent("UI_Master");
    }

    ,SetPageFight(page) //register the fighters from the given page
    {
        this.AddPlayer();
        let index = 0 ; //index is the fighter position in currentMonsters array
        cc.log('setting fight');
        this.activesFighters.push(this.currentPlayer); //the player scirpt is registered first
        this.currentPlayer.index = index;
        for (let monster of page.currentMonsters){
            index ++;
            monster.getComponent('FighterScript').index = index ;
            this.activesFighters.push(monster.getComponent('FighterScript')); //the monsters scripts are registered then
        };
        this.alivesFighters = index + 1;
        //this.SetTurns();
        this.BeginRound();
    },

    CleanUp(){
        this.currentPage = null ;
        this.currentPlayer = null;
        this.currentMonsters = null ;
        this.currentTurn = null ;
        this.activesFighters = [];
        this.turnOrder=[];
        this.activesEffects = [];
        this.isVictory = false;
    },

    EndFight(isVictory){
        cc.log("fight end");
        this.node.off("TurnState",this.TurnEnded,this) ;   
        this.UIMaster.SetText(this.UIMaster.currentPage,'the fight end !');
        this.UIMaster.SetChoices(this.UIMaster.currentPage ,this.UIMaster.currentPage.choices);
    },

    BeginRound(){
        this.choicesValidated = 0 ;
        this.currentTurn = 0;
        this.BeginTurn();
    },

    EndRound(){
        cc.log('Round end ' , this.activesEffects.length , this.alivesFighters);
        var nextEffectArray = new Array();
        for(let i = 0 ; i < this.activesEffects.length;i++)
        {
            this.ExecuteEffect(this.activesEffects[i]);
            if(this.activesEffects[i].duration > 0){nextEffectArray.push(this.activesEffects[i])}
        }
        this.activesEffects = nextEffectArray ;
        cc.log('checking for survivors');

        //for now the victory condition is just last man standing
        if(this.alivesFighters <2){
            let isVictory = false ;
            if(this.currentPlayer.characteristics.healthPoints > 0){isVictory = true};
            this.EndFight(isVictory);
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
        cc.log('begin turn ',this.currentTurn , this.activesFighters[this.currentTurn].displayName);
        this.ChooseTarget(this.currentTurn);
        this.ChooseAction(this.currentTurn);

    },

    EndTurn(){
        cc.log('ending turn ',this.currentTurn )
        if(this.currentTurn + 1 >= this.activesFighters.length){
            this.EndRound();
        }
        else{
            this.currentTurn ++
            this.BeginTurn();
        }
        
    },

    RemoveFighter(fighterScript)
    {
        cc.log('removing ',fighterScript);
        fighterScript.node.active = false ;
        this.alivesFighters --;
        //this.activesFighters.splice(fighterScript.index,1) ;//remove the fighter at the designed index
    },

    AddFighter(page ,template)
    {
        //add a fighter to a page, completely independant of combat
        cc.log("adding fighter to ",page.index);
        
        let fighter = cc.instantiate(this.FighterPrefab);
        page.displayNode.getChildByName('ImageDisplay').addChild(fighter);
        fighter.setPosition(template.top , template.left);
        page.currentMonsters.push(fighter);
        this.InitFighter(fighter.getComponent('FighterScript'),template.characteristics);
        fighter.currentPage = page.index ;
        return fighter;
    },

    AddPlayer() //Set the player fighter
    {
        let player = cc.instantiate(this.FighterPrefab);
        this.currentPlayer = player ;
        //stats here are temporary
        var stats = {
            attackPoints: 30,
            defensePoints: 15,
            healthPoints: 45,
            isSelected: false,
            name: "player"
        };
        this.InitFighter(player.getComponent('FighterScript'),stats);
        player.getComponent('FighterScript').displayName = 'player ';
        player.getComponent('FighterScript').isPlayer = true ;
        player.getComponent('FighterScript').Team = 1;
        //player.getChildByName('InfoDisplay').getComponent('UI_Info').Refresh();

        player.color = cc.Color.GREEN ;
        //player.opacity = 0 ;
        this.currentPlayer = player.getComponent('FighterScript') ;
        player.scale = 0;
        player.parent = this.node;
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
        var fighterScript = this.activesFighters[fighterIndex] ;
        //this is temporary
        cc.log('choosing target',fighterIndex);
        if(this.activesFighters.length < 2){
            fighterScript.target = this.activesFighters[1];
        }
        //else {}; for now only one targetis possible

    },


    ReceiveChoiceEvent(event) //trigger when the player click on an action button
    {
        cc.log(this.name,' received choice event ',event.detail.hasOwnProperty('action'));
        if((event.detail.hasOwnProperty('action')) && this.isWaitingPlayerChoice ){
            cc.log('action');
            this.isWaitingPlayerChoice = false ;
            this.ExecuteAction(this.currentPlayer.index,event.detail.action,1);
        }
    },

    ChooseAction(fighterIndex){
        var fighterScript = this.activesFighters[fighterIndex] ;
        if(fighterScript.isPlayer){
            this.isWaitingPlayerChoice = true ; 
            this.UIMaster.SetChoices(this.UIMaster.currentPage , fighterScript.possiblesActions);
        }
        else{
            // the monster ai
            cc.log('monster is playing');
            var bestActionWeight = 0;
            var bestActionIndex = 0;
            var targetIndex ;
            var actionWeight = 0 ;
            for(var i = 0 ; i < fighterScript.possiblesActions.length;i++){ //for each action possible
                
                for(var j = 0 ; j < this.activesFighters.length;j++){ //and each target possible
                    cc.log('test weighting action',fighterScript.characteristics.name , fighterScript.possiblesActions[i].name,this.activesFighters[j].characteristics.name);
                    actionWeight = this.WeighAction(fighterScript.index , fighterScript.possiblesActions[i].name, j) ;//weigh the effect of the action
                    
                    if(actionWeight > bestActionWeight){
                        bestActionIndex = i;
                        bestActionWeight = actionWeight;
                        targetIndex = j ;
                    }
                } 
            };
            this.ExecuteAction( fighterScript.index , fighterScript.possiblesActions[bestActionIndex].name, targetIndex);
        };
    },

    ExecuteAction(initiaterIndex,actionName,targetIndex){
        var initiater = this.activesFighters[initiaterIndex];

        cc.log(initiater.displayName ,' executing action',actionName,initiaterIndex,targetIndex);
        for (var i = 0; i< initiater.possiblesActions.length;i++)
        {
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

    WeighAction(initiaterIndex,actionName,targetIndex){
        
        var worth = 0;
        var totalPower = 0;
        var multiplier = -1 ;
        var initiater = this.activesFighters[initiaterIndex];
        cc.log('test wheighting action', initiater.possiblesActions);
        var target = this.activesFighters[targetIndex];
        
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
        cc.log(effect.initiaterIndex ,' executing effect on ',effect.targetIndex,this.activesFighters[effect.targetIndex]);
        var target = this.activesFighters[effect.targetIndex];
        
        if(effect.isPermanent)
        {
            
            target.characteristics[effect.attributeTargeted] += effect.finalMagnitude;
            cc.log(target.characteristics[effect.attributeTargeted] , ' : new value for ',effect.attributeTargeted);

            effectEvent.detail = effect ;
            
            this.activesFighters[effect.targetIndex].node.dispatchEvent(effectEvent);
            //effect.target.ReceiveEffect();

            if(target.characteristics.healthPoints <= 0){this.RemoveFighter(target)};
            
        }
    },

    isSameTeam(fighterIndex1, fighterIndex2){
        return (this.activesFighters[fighterIndex1] == this.activesFighters[fighterIndex2])
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
    }

});
