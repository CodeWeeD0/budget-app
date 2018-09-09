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

    //function to calculate total expense and income and store it in the allrecords obj
    var calculateTotals = function(){
        var sum=0;
        allRecords.allItems["exp"].forEach(function(curr){
            sum += curr.value;
        });
        allRecords.totals["exp"] = sum;

        sum=0;
        allRecords.allItems["inc"].forEach(function(curr){
            sum += curr.value;
        });
        allRecords.totals["inc"] = sum;
        
    }

    //this is a structure that uses above custom data types to save expenses and incomes (all related datas packed in one) along with present totals
    var allRecords = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentage: -1
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

        calculateBudget: function(){

            calculateTotals();

            allRecords.budget = allRecords.totals["inc"] - allRecords.totals["exp"];

            if(allRecords.totals["inc"] >= allRecords.totals["exp"])
                allRecords.percentage = Math.round((allRecords.totals["exp"] / allRecords.totals["inc"]) * 100);

            return {
                totalInc : allRecords.totals["inc"],

                totalExp : allRecords.totals["exp"],

                budget : allRecords.budget,

                percentage : allRecords.percentage
            }
        },

        testFunc : function(){
            console.log(allRecords);
        }
    };
})();



////////////////////////////////////////////////////////////////
var UIController =  (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        expensePercentage: '.budget__expenses--percentage'
    };

    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
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

        clearFields: function(){
            document.querySelector(DOMstrings.inputDescription).value = "";
            document.querySelector(DOMstrings.inputValue).value = "";

            document.querySelector(DOMstrings.inputDescription).focus();
            /*Another way to do it-
                fields = document.querySelectorAll(DOMstings.inputDescription + ',' + DOMstrings.inputValue);
                fields is a list, line below is converting list type to an array
                fieldsArr = Array.prototype.slice.call(fields);
                fieldsArr.forEach(function(current, index, array){
                    current.value = "";
                }) */
        },

        displayBudget: function(obj){

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget>0 ? "+ "+obj.budget : obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;

            if(obj.percentage != -1)
                document.querySelector(DOMstrings.expensePercentage).textContent = obj.percentage;
            else
                document.querySelector(DOMstrings.expensePercentage).textContent = "---";
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };
})();




////////////////////////////////////////////////////////////////////////////////////////////
var controller = (function(budgetCtrl, UICtrl){

    var updateBudget = function(){
        //initiate calculate budget + get budget calculated
        budget = budgetCtrl.calculateBudget();

        //display updated budget
        UICtrl.displayBudget(budget);
    }

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

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        //storing the input into internl storage
        newItem = budgetCtrl.addInput(input.type, input.description, input.value);

        UICtrl.addNewItem(input.type, newItem);

        UICtrl.clearFields();
        
        updateBudget();
        }
    }

    return{
        init: function(){
            setupEventListeners();

            UICtrl.displayBudget({
                totalInc : 0,
                totalExp : 0,
                budget : 0,
                percentage : "---"
            })
        }
    };
})(budgetController,UIController);

controller.init();