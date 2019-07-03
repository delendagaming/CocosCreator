// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var GameAction = require("GameAction");
var test = cc.Class({
    name : 'item',
    properties: {
        
    }
})
//var Info = require("UI_Info");
var UiMaster ;

cc.Class({
    extends: cc.Component,
    properties: {
            DisplayName:"Default Fighter",
            fighterAttributes:{
                default : null ,
                Health:{
                    default:100,
                    min:0,
                    ui : "lol",
                },
                MaxHealth:{
                    default:100,
                    min:0,
                },
                Armor : 10,
                Physic : 10,
                Magic : 5,
            },
            isPlayer:false,
            
            UIDisplay : cc.Node,
            _Targets:[],
            Team : {default : 0},
            _CombatScript : cc.Component ,
            _PossiblesActions : [],
            StartingActions : [GameAction]
    },

    onLoad () 
    {
         
        //this.onDestroy.on('EndTurn',function(event){this.EndTurn()});
    },

    Init(data){
        for (attribute in data)
        {
            let attname = attribute.toString();
            this[attname] = data[attribute] ;
        }
    },

    start () {
        this.UiMaster = cc.find("Canvas").getComponent("UI_Master") ;
        this._CombatScript = cc.find("Canvas").getComponent("CombatScript") ;

        for (let i = 0 ; i<this.StartingActions.length; i++) //initiate fighter actions
        {
            let a = new GameAction() ;
            a.GetAction(this.StartingActions[i]);
            this._PossiblesActions.push(a) ;
        }
        
    },

    select() //select the targets
    {
        this._Targets = [] ;
        cc.log('Selecting ', this._CombatScript.ActiveFighters);
        for (let i = 0 ; i < this._CombatScript.ActiveFighters.length; i++)
        {
            let fighter = this._CombatScript.ActiveFighters[i] ;
            if(fighter.getComponent('FighterScript').Team != this.Team){this._Targets.push(fighter)};
            cc.log(this._Targets, ' test');
        }
        cc.log(this._Targets[0].getComponent('FighterScript').DisplayName, ' selected');
        //this._CombatScript.activeFighters[0];
    },

    ExecuteAction(Action)
    {
        cc.log(this.DisplayName ,' execute action', Action);
        for (let i = 0 ; i < this._Targets.length ; i++)
        {
            cc.log('Acting');
            this._Targets[i].getComponent('FighterScript').ReceiveEffect(-30);
        };
        this.EndTurn();
        

    },

    ChooseNextAction() //ai logic
    {
        cc.log( this.name," is choosing");
        this.scheduleOnce(function() {
            // Here `this` is referring to the component
            this.ExecuteAction('Attack');
        }, 2);
        
    },

    BeginTurn() //trigger when this fighter can play
    {
        let f = this ;
        
        let ev = new cc.Event.EventCustom('TurnState',true);
        ev.payload = this;
        ev.detail = 'Begin' ;
        this.node.dispatchEvent(ev,true);
        this.select();
        if(!this.isPlayer)
        {
            this.ChooseNextAction();
        }
    },

    EndTurn()
    {
        cc.log(this.DisplayName , ' end turn');
        let ev = new cc.Event.EventCustom('TurnState',true);
        ev.payload = this;
        ev.detail = 'End' ;
        this.node.dispatchEvent(ev,true);
    },

    ReceiveEffect(Payload)
    {
        cc.log('test ' , Payload)
        this.Health += Payload ;
        

        let ev = new cc.Event.EventCustom('Effect',true) ;
        ev.detail = Payload.toString() ;
        //cc.log(this.DisplayName , ' ReceiveEffectc ' , ev.detail);
        this.node.dispatchEvent(ev,true);

        if(this.Health < 0){this.Destroyed()};
        
    },


    Destroyed()
    {
        cc.log('destroyed ?' , this.Health);
        this.node.dispatchEvent(new cc.Event.EventCustom('Destroyed',true));
        this.node.active = false ;
    },

    Modify()
    {
        var results = [] ;
        if(this.haxOwnProperty([arguments[0]]) )
        {
            this[arguments[0]] = this[arguments[1]];
            results[0] = this[arguments[0]] ;
            results[1] = this[arguments[1]] ;
        }
        return results ;
    },

    update (dt) {
        //this.Health ++ ;
    },
});

