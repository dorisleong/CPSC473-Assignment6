var ViewModel = function (currentUsers) {
    this.score = ko.observable(score); 

    this.userToAdd = ko.observable("");
    this.allusers = ko.observableArray(currentUsers); // Initial users
 
    this.adduser = function () {
        if ((this.userToAdd() != "") && (this.allusers.indexOf(this.userToAdd()) < 0)) // Prevent blanks and duplicates
            this.allusers.push(this.userToAdd());
        this.userToAdd(""); // Clear the text box
    };
 
    this.removeSelected = function () {
        this.allusers.removeAll(this.selectedusers());
    };
 
};
 
ko.applyBindings(new ViewModel());