var budgetController = (function(){

    //this is the prototype or class for a specific type of non-primitive data type asper our convenience
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //this is a structure that uses above custom data types to save expenses and incomes (all related datas packed in one) along with present totals
    var allRecords = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        }
    }


    return {
        addInput: function(type, des, val){
            if(allRecords.allItems[type].length > 0)
                ID = allRecords.allItems[type][allRecords.allItems[type].length - 1].id + 1;
            else
                ID = 0;
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if( type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            allRecords.allItems[type].push(newItem);

            return newItem;
        },

        testFunc : function(){
            console.log(allRecords);
        }
    };
})();


var UIController =  (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list'
    };

    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value
            };
        },

        addNewItem: function(type, obj){
            var html, element;

            if(type === "inc"){
                element = DOMstrings.incomeList;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>    </div> </div></div>'
            } else if(type === "exp"){
                element = DOMstrings.expenseList;

                html =  '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div>   <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };
})();


var controller = (function(budgetCtrl, UICtrl){
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13)
                ctrlAddItem();
            });
        }

    var ctrlAddItem = function(){
        var input, newItem;
        //getting input from UI
        input = UICtrl.getInput();
        console.log(input);
        //storing the input into internl storage
        newItem = budgetCtrl.addInput(input.type, input.description, input.value);

        UICtrl.addNewItem(input.type, newItem);
    }

    return{
        init: function(){
            setupEventListeners();
        }
    };
})(budgetController,UIController);

controller.init();