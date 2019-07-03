// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html



cc.Class({
    extends: cc.Component,

    properties: {
        InfoLine : cc.Node
        ,LinkedObj : cc.Node 
        ,LinkedScript : cc.Component
        ,lines : [cc.node]
        ,FighterName : cc.Label
        ,Health : cc.Label 
        ,Bar :cc.ProgressBar
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {},

    start () {
        
        //register the parent node as the node to ge the infos
        this.LinkedObj = this.node.parent ;
        //this.LinkedObj.on('')

        this.LinkedScript = this.LinkedObj.getComponent("FighterScript");

        this.LinkedObj.on('Effect',this.RefreshInfo,this);

        //this.RefreshInfo(this.LinkedScript);
    },

    RefreshInfo(){
        /*var obj = arguments;
        if (!obj){
            obj = this.LinkedScript
        };*/
        let obj = this.LinkedScript ;
        this.FighterName.string = obj.DisplayName; 
        cc.log(obj.Health,' Character health');
        this.Health.string = obj.Health.toString();
        this.Bar.Progress = obj.Health / obj.MaxHealth ;
        this.Bar.Progress = 0 ;

    }

    ,ToggleVisibility()
    {
    }

    // update (dt) {},
});
