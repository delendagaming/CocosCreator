// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var sc = this ;

cc.Class({
    extends: cc.Component,

    properties: {

        ChoicePrefab : cc.Prefab, //the type of button to display
        pageContainer :cc.Node, //the node containing the actions possibles
        _ActionsButtons : null ,
        _PlayerInfo : cc.node,
        TextDisplay : cc.Label, //the ui node where the text will generally appear
        _TextParagraphes : cc.string, //the text itself
        BackgroundImage : cc.Node, //the principale image
        pagePrefab : cc.Prefab ,
        _pagesPool : cc.NodePool ,
        _pages : null ,
        currentPage : cc.node ,
        testQuest : cc.JsonAsset ,
        GameActionDatabase : cc.JsonAsset,
        logText : cc.string ,
        popupText : cc.Prefab ,
        

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

    onLoad () {
        this.ButtonPool = new cc.NodePool();
        let initcount = 10 ;
        this.popupText = cc.instantiate(this.popupText) ;
        for (let i = 0 ; i < initcount ; i++) //instentiate initial pool
        {
            let button = cc.instantiate(this.ActionButton);
            this.ButtonPool.put(button) ;
        }
        this.node.on('Choice',this.ReceiveChoiceEvent,this);
        this.node.on('Effect',this.ReceiveEffectEvent,this);

    },

    start () {
        for(let action in this.testQuest.json.Paragraphs){
            cc.log('Json ?',action);
        }
        this.LoadQuest(this.testQuest.json);
    },

    LoadQuest(Quest){ //load all the possibles pages from a quest object
        cc.log("loading quest " , Quest.id);
        this._pages = new cc.Object() ;

        for(let paragraph of Quest.Paragraphs) //for each paragraph of the quest create a corresponding page Node
        {
            this.SetPage(paragraph);
        }
        //create the presentation page
        var firstChoice = {
            depthNumber : 0,
            paragraphNumber : 1,
        };
        var firstParagraph = {
            depthNumber : 0,
            paragraphNumber : 0,
            paragraphType : 'narration',
            paragraphSubTypes : {
                isEliteMobCombat: false,
                isFinalBossCombat: false,
                isGraphicalRiddle: false,
                isMobCombat: false,
                isPointAndClickPath: false,
                isSuddenDeath: false,
                isTextualPath: false,
                isTextualRiddle: false,
                isVictory: false
              },
            inputText :'quest : '+  Quest.Title  +'\n'+' creation date : ' +Quest.CreationDate,
            nextParagraphs : [firstChoice],
        };

        this.currentPage = this.SetPage(firstParagraph);
        this.currentPage.displayNode.active = true ;
    },

    SetPage(paragraph){
        var page = {
            id : paragraph.depthNumber.toString() +'-'+ paragraph.paragraphNumber.toString(),
            title : paragraph.Title,
            displayNode : cc.instantiate(this.pagePrefab),//instantiate a page node from prefab
            inputText : paragraph.inputText,
            type : paragraph.paragraphType,
            subtype : paragraph.paragraphSubTypes,
            choices : paragraph.nextParagraphs ,
            currentChoices : [],
            backgroundImage : paragraph.backgroundImageURL,
            selectedMonster : paragraph.selectedMonster,
            currentMonsters : [],
        } ;

        for(let choice of page.choices)
        {
            choice.type = page.type;
        };


        if(page.backgroundImage){
            cc.log( 'loading texture ',page.backgroundImage );/*è

            var tex = new cc.Texture2D ;
            var img = new Image();
            img.src = page.backgroundImage;
            tex.initWithElement(img);
            cc.log('image? ' , img );
            page.displayNode.getChildByName('Background').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(img);
            cc.loader.load({url:page.backgroundImage}, function (err, texture) {
                if(err){
                    cc.log('texture not loading for ',page.id,' : ',err.message);
                };
                cc.log('image ?',texture);
                if(texture){page.displayNode.getChildByName('Background').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);};
                
                
                // Use texture to create sprite frame
            });*/
            
        }
        page.displayNode.getChildByName('TextDisplay').getComponent(cc.Label).string = paragraph.inputText ; //copy the paragraph text to the page node
        page.displayNode.getChildByName('TitleDisplay').getComponent(cc.Label).string =  page.id ;
        this.node.getChildByName('PageContainer').addChild(page.displayNode) ; //add the page to the container node
        page.displayNode.active = false ;
/*
        if(page.subtype.isSuddenDeath || page.subtype.isVictory){ //add a retry button when game over
            page.choices.push({
                depthNumber : 0,
                paragraphNumber : 0,
            })
        };*/

        switch(paragraph.paragraphType){
            case 'dialogue':
                break ;
            case 'narration':
                break ;
            case 'riddle':
                break ;
            case 'combat':
                if(page.selectedMonster){this.node.getComponent('Fight_Master').AddFighter(page,page.selectedMonster )};
                cc.warn('adding monster');
                break;
        }

        this.SetChoices(page , page.choices); //create the buttons using the "next paragraphs" options

        //register the created node
        this._pages[page.id] = page ; //register the page with the key as attribute for easy access
        return page ;
    },

    SetChoices(page ,choiceList) //take a list of choice for a given page and create buttons to execute them
    {
        var choicesLayout = page.displayNode.getChildByName('ChoicesLayout'); 
        cc.log('titi ',choiceList);
        //remove all the previous choices for the selected page
        for (let i = 0 ; i < choicesLayout.children.length;i++){
            cc.log('destroying ',choicesLayout.children[i]);
            choicesLayout.children[i].destroy();
        }
        
        for (let choice of choiceList)
            {
                cc.log('setting choice ',choice,choice.type,' for page ',page.id);
                var choicebutton = cc.instantiate(this.ChoicePrefab); //create node button from template
                switch(choice.type){
                    case 'dialogue':
                        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
                        choicebutton.getComponent('ButtonScript').SetEvent(choice);
                        choicebutton.getChildByName("Label").getComponent(cc.Label).string = choice.depthNumber + '-' + choice.paragraphNumber; //wright the paragraph on the button, remove this later
                        choicebutton.active = true;
                        break ;
                    case 'narration':
                        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
                        choicebutton.getComponent('ButtonScript').SetEvent(choice);
                        choicebutton.getChildByName("Label").getComponent(cc.Label).string = choice.depthNumber + '-' + choice.paragraphNumber; //wright the paragraph on the button, remove this later
                        choicebutton.active = true;
                        break ;
                    case 'riddle':
                        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
                        choicebutton.getComponent('ButtonScript').SetEvent(choice);
                        choicebutton.getChildByName("Label").getComponent(cc.Label).string = choice.depthNumber + '-' + choice.paragraphNumber; //wright the paragraph on the button, remove this later
                        choicebutton.active = true;
                        //choicebutton.setPosition(choice.selectedPointer.top , choice.selectedPointer.left);
                        break ;
                    case 'combat':
                        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
                        choicebutton.getComponent('ButtonScript').SetEvent(choice);
                        choicebutton.getChildByName("Label").getComponent(cc.Label).string = choice.depthNumber + '-' + choice.paragraphNumber; //wright the paragraph on the button, remove this later
                        choicebutton.active = true;
                        break;
                    case 'action':
                        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
                        choicebutton.getComponent('ButtonScript').SetEvent(choice);
                        choicebutton.getChildByName("Label").getComponent(cc.Label).string = choice.name; //wright the paragraph on the button, remove this later
                        choicebutton.active = true;
                        break;
                }
                
                
                
                
            }
    },

    SetText(page,text){
        page.displayNode.getChildByName('TextDisplay').getComponent(cc.Label).string = text ;
    },

    AddChoice(page, choice){
        var choicesLayout = page.displayNode.getChildByName('ChoicesLayout'); 
        var choicebutton = cc.instantiate(this.ChoicePrefab); //create node button from template
        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
        var nextid = choice.depthNumber+'-'+choice.paragraphNumber ;
        choicebutton.getComponent('ButtonScript').SetEvent(clickevent);
        choicebutton.getChildByName("Label").getComponent(cc.Label).string = nextid;
    },

    GoToPage(newPageName) //change the current displayed page
    {
        cc.log("going to paragraph ",newPageName);
        cc.log("old paragraph ",this.currentPage.id);
        this.currentPage.displayNode.active = false ; //hide the current page before getting to the new one
        cc.log("new paragraph ",this._pages[newPageName].id);
        this.currentPage = this._pages[newPageName]; //register new page as current one
        this.currentPage.displayNode.active = true ; //show the newpage

        //triggers relative to the event happneing on the new page
        switch(this._pages[newPageName].type){
            case 'dialogue':
                break ;
            case 'narration':
                break ;
            case 'riddle':
                break ;
            case 'combat':
                this.getComponent('Fight_Master').SetFight(this._pages[newPageName]);
                break ;
        }
        
        
        
    },

    ReceiveChoiceEvent(event){ //triggered for all sorts of events
        cc.log("event ? ",event.type ,event.detail.type);
        switch(event.detail.type){
            case 'GoToPage':
                this.GoToPage(event.detail.id);
                break;
            case 'action':cc.log('action event');
                break;
        }

        
    },

    ReceiveEffectEvent(event){
        cc.log('displaying event ',event.target);
        var textAnim = this.popupText.getComponent(cc.Animation);
        textAnim.play().repeatCount = 1;
        this.popupText.parent = this.node;
        this.popupText.getComponent(cc.Label).string =  ' '+ event.detail.attributeTargeted + ' : ' + event.detail.finalMagnitude ;
        cc.log(textAnim,' text anim ?')
        var effectAnim = event.target.getComponent(cc.Animation);
        effectAnim.play().repeatCount = 4;



    }
    // update (dt) {},
});
