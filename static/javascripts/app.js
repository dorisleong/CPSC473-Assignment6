var main = function () {
  'use strict';
  var currentQuestion;
  var currentAnswerId;
  var currentAnswer;
  var socket = io.connect('http://localhost:3000/');
  var userList = [];
  var answered = false;
  var currentScoreText = 'Right: 0, Wrong: 0';

  //Knockout

  var ViewModel = {
    users: ko.observableArray(), // Initial users
    score: ko.observable(),

    userJoined: function () {
      socket.on('update', function (updatedUsers) {
        this.users.removeAll();
        this.users.push(updatedUsers);
      });
    },

    submittedAnswer: function () {
      $.ajax({
        url: '/score',
        dataType: 'json',
        type: 'GET',
        contentType: 'application/json',
        success: function (response) {
          this.score = 'Right: ' + response.right + ', Wrong: ' + response.wrong;
        }
      });
    }
  };

  ko.applyBindings(ViewModel);

  //Update the current list of players when one connects/disconnects


  var postAJAX = function (url, data, successFunction) {
    $.ajax({
      url: url,
      dataType: 'json',
      type: 'POST',
      data: data,
      contentType: 'application/json',
      success: function (response) {
        successFunction(response);
      }
    });
  };

  //Get question from server (GET /question)
  var getQuestion = function () {
    $.ajax({
      url: '/question',
      dataType: 'json',
      type: 'GET',
      contentType: 'application/json',
      success: function (response) {
        currentQuestion = response.question;
        currentAnswerId = response.answerId;
      }
    });
  }

  //Send guess to server returns if correct (POST /answer)
  var postGuess = function () {
    var guess = $('#guess').val();
    postAJAX('/answer', JSON.stringify({
      answerId: currentAnswerId,
      answer: guess
    }), function (response) {
      currentAnswer = response.answer;
      if (response.correct === true) {
        $('#result').text('Correct!');
      } else {
        $('#result').text('Wrong!');
      }
      $('#inputGuess').prop('disabled', true);
    });
  }

  //Send new question and answer from input to server (POST /question)
  var postQuestion = function () {
    var questionInput = $('#newQuestion').val();
    var answerInput = $('#newAnswer').val();
    postAJAX('/question', JSON.stringify({
      question: questionInput,
      answer: answerInput
    }), function (response) {
      $('#addConfirmation').text(response.confirm);
    });
    $('#newQuestion').val('');
    $('#newAnswer').val('');
  }

  //Get score - after each answer submitted (GET /score) 
  var getScore = function () {
    // $.ajax({
    //   url: '/score',
    //   dataType: 'json',
    //   type: 'GET',
    //   contentType: 'application/json',
    //   success: function (response) {
    //     //$('.score').text('Right: ' + response.right + ', Wrong: ' + response.wrong);
    //     currentScoreText = 'Right: ' + response.right + ', Wrong: ' + response.wrong;
    //   }
    // });
  }

  //start with game, round, create sections hidden
  $('.game').hide();
  $('.round').hide();
  $('.create').hide();
  $('#createShow').click(function () {
    $('.create').toggle();
  });

  $('#inputUsername').click(function () {
    //check if no socket user with same name
    var username = $('#username').val();
    var taken = false;

    for (var i = 0; i < userList.length; i++) {
      if (userList[i].username == username) {
        $('#usernameError').text('Username taken');
        taken = true;
      }
    }

    if (!taken) {
      socket.emit('userJoin', username);
      socket.emit('anotherUserJoins', username);
      $('.game').show();
      $('.join').hide();
    }
  });

  $('#start').click(function () {
    $('.round').show();
    $('#start').hide();
    socket.emit('play');
  });

  $('#inputGuess').click(function () {
    postGuess();
    answered = true;
    getScore();
  });

  $('#addQuestion').click(function () {
    postQuestion();
  });

  getQuestion();
  socket.on('newQuestion', function () {
    $('.round').hide();
    $('#start').show();
    $('#result').empty();
    $('#guess').val('');
    $('#correctAnswer').text(currentAnswer);
    getQuestion();
  });

  socket.on('gameStart', function () {
    answered = false;
    var count = 15;

    var counter = setInterval(timer, 1000);
    $('#inputGuess').prop('disabled', false);
    $('.round').show();
    $('#start').hide();
    $('#question').text(currentQuestion);

    function timer() {
      $('.roundTime').text(count);
      count -= 1;
      if (count < 0) {
        if (answered === false) {
          postGuess();
        }
        clearInterval(counter);
        socket.emit('endRound');
        return;
      }
    }
  });

}; //End of main

$(document).ready(main);