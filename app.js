var budgetController = (function(){

    //this is the prototype or class for a specific type of non-primitive data type asper our convenience
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc>0){
            console.log("hi");
            this.percentage = Math.round((this.value/totalInc)*100);
        }
    }

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

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

        calcPercentages: function(){
            allRecords.allItems.exp.forEach(function(curr){
                curr.calcPercentage(allRecords.totals.inc);
            });
        },

        deleteItem : function(type,id){
            var ids,index;
            
            ids = allRecords.allItems[type].map(function(curr){
                return curr.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                allRecords.allItems[type].splice(index,1);
            }
        },

        getPercentages: function(){
            var allPerc = allRecords.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPerc;
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
        expensePercentage: '.budget__expenses--percentage',
        container: '.container',
        percentageLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };

    var formatNumber = function(num,type){
        if(num=== 0)
            return "0.00"
        var arr = new Array();

        num = Math.abs(num);

        num = num.toFixed(2);

        numSplit = num.split('.');

        numDec = parseInt(numSplit[0]);
        //loop to create an array of numbers with groups of 3 digits from right side(ones place)
        while(numDec> 1000){
            var tmp = numDec%1000;
            if(tmp < 100)
                tmp = '0' + tmp;
            arr.unshift(tmp);
            numDec = (numDec - tmp)/1000;
        }

        if(numDec>0)
            arr.unshift(numDec);
        numSplit[0] = arr.join(',');
        num = numSplit.join('.');

        if(type === 'inc')
            num = '+ '+num;
        else if(type=== 'exp')
            num = '- '+num;
        return num;
    };

    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length; i++){
            callback(list[i],i);
        }
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
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>    </div> </div></div>'
            } else if(type === "exp"){
                element = DOMstrings.expenseList;

                html =  '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div>   <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>'
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteItem: function(id){
            el = document.getElementById(id);
            el.parentNode.removeChild(el);
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

            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget>=0 ? formatNumber(obj.budget,'inc') : formatNumber(obj.budget,'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.percentage != -1)
                document.querySelector(DOMstrings.expensePercentage).textContent = obj.percentage;
            else
                document.querySelector(DOMstrings.expensePercentage).textContent = "---";
        },

        displayPercentages(percentages){
            var fields = document.querySelectorAll(DOMstrings.percentageLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });
        },

        displayMonth: function(){
            var date = new Date();
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            document.querySelector(DOMstrings.monthLabel).textContent = months[date.getMonth()] + ' ' + date.getFullYear();
        },

        changedType: function(){

            var fields = document.querySelectorAll(DOMstrings.inputType + ','
             + DOMstrings.inputDescription + ',' 
             + DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
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

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        }

    var ctrlAddItem = function(){
        var input, newItem;
        //getting input from UI
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        //storing the input into internl storage
        newItem = budgetCtrl.addInput(input.type, input.description, parseFloat(input.value));

        UICtrl.addNewItem(input.type, newItem);

        UICtrl.clearFields();
        
        updateBudget();

        updatePercentages();
        }
    }

    var updatePercentages = function(){
        budgetCtrl.calcPercentages();

        var allPerc = budgetCtrl.getPercentages();

        UICtrl.displayPercentages(allPerc);
    }
    

    var ctrlDeleteItem = function(event){
        var item,splitItem,type,id;
        item = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitItem = item.split('-');
        type = splitItem[0];
        id = parseInt(splitItem[1]);

        budgetCtrl.deleteItem(type,id);
        UICtrl.deleteItem(item);
        updateBudget();
        updatePercentages();
    };

    return{
        init: function(){
            setupEventListeners();
            UICtrl.displayMonth();
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