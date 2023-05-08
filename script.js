(function () {

  let game = new Game(),
      player = new Player(),
      dealer = new Player(),
      running = false,
      blackjack = false,
      insured = 0,
      deal;


  function Player(){
    let hand = [],
      wager = 0,
      cash = 1000,
      bank = 0,
      ele = '',
      score = '';

    this.getElement = function(){
      if(this === player){
        ele = '#phand';
        score = 'pcard-0 .popover-content';

      }else{
        ele ='#dhand';
        score = 'dhand-0 .popover-contnet';
      }

      return {'ele': ele, 'score' : score};
    }

    this.getHand = function() {
      return hand;
    }

    this.setHand = function(card){
      hand.push(card);
    }

    this.resetHand = function(){
      hand = [];
    }

    this.getWager = function(){
      wager += parseInt(money, 0);
    }

    this.setWager = function(){
      wager += parseInt(money, 0);
    }

    this.resetWager = function(){
      wager = 0
    }

    this.checkWager = function(){
      return wager <= cash ? true : false;
    }

    this.getCash = function(){
      return cash.formatMoney(2, '.', ',');
    }

    this.setCash = function(money){
      cash +- money;
      this.updateBoard();
    }

    this.getBank = function(){
      $('#bank').html('Winnings : $' + bank.formatMoney(2, '.', ','));
      if(bank < 0){
        $('#bank').html(`Winnings : <span>-$${bank.formatMoney(2, '.', ',').toString().replace('-', '')}</span>`)
      }
    }

    this.setBank = function(money){
      bank += money;
      this.updateBoard();
    }

    this.flipCard = function(){
      $('.down').each(function(){
        $(this).removeClass('down').addClass('up');
        renderCard(false, false, false, $(this));
      })

      $('#dcard-0 .popover-content').html(dealer.getScore());
    }
  }

  function Deck(){
    let ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
        suits = ['&#9824;', '&#9827;', '&#9829;', '&#9670;'],
        deck = [],
        i, x, card;

    this.getDeck = function(){
      return this.setDeck();
    }

    this.setDeck = function(){
      for(i = 0; i < ranks.length; i++){
        for(x = 0; x < suits.length; x++){
          card = new Card({'rank': ranks[i]})

          deck.push({
            'rank' : ranks[i],
            'suit' : suits[x],
            'value' :card.getValue()
          })
        }
      }

      return deck;
    }
  }

  function Shuffle(deck){
    let set = deck.getDeck(),
        shuffled = [],
        card;

      this.setShuffle = function(){
        while(set.length > 0){
          card = Math.floor(Math.random() * set.length);

          shuffled.push(set[card])
          set.splice(card, 1);
        }
        return shuffled;
      };

      this.getShuffle = function(){
        return this.setShuffle();
      }
  }

  function Card(card){
    this.getRank = function(){
      return card.rank;
    }

    this.getSuit = function(){
      return card.suit;
    }

    this.getValue = function(){
      let rank = this.getRank(),
        value = 0; 

      if (rank == 'A'){
        value = 11;
      }else if(rank == 'K'){
        value = 10;
      }else if(rank == 'Q'){
        value = 10;
      }else if(rank == 'J'){
        value = 10;
      }else{
        value = parseInt(rank, 0);
      }

      return value
    }
  }

  function Deal(){
    let deck = new Deck(),
        shuffle = new Shuffle(deck),
        shuffled = shuffle.getShuffle(),
        card;

    this.getCard = function(sender){
      this.setCard(sender);
      return card;
    }

    this.setCard = function(sender){
      card = shuffled[0];
      shuffled.splice(card, 1);
      sender.setHand(card);
    }

    this.dealCard = function(num, i, obj){
      if(i >= num) {return false;}

      let sender = obj[i],
          elements= obj[i].getElements(),
          score = elements.score,
          ele = elements.ele,
          dhand = dealer.getHand();

      deal.getCard(sender);

      if (i < 3){
        renderCard(ele, sender, 'up');
        $(score).html(sender.getScore());
      }else{
        renderCard(ele,sender, 'down');
      }

      if(player.getHand().length < 3){
        if(dhand.length > 0 && dhand[0].rank === 'A'){
          setActions('insurance');
        }

        if(player.getScore() === 21){
          if(!blackjack){
            blackjack = true;
            getWinner();
          }else{
            dealer.flipCard();
            $('#dscore span').html(dealer.getScore());
          }
        } else{
          if(dhand.length > 1){
            setActions('run');
          }
        }
      }

      function showCards(){
        setTimeout(function(){
          deal.dealCard(num, i + 1, obj);
        }, 500);
      }

      clearTimeout(showCards());
    }
  }

  function resetBoard(){
    $('#dhand').html('');
    $('#phand').html('');
    $('#result').html('');
    $('#phand, #dhand').css('left', 0);
  }

  function showBoard(){
    deal.dealCard(4, 0 [player, dealer, player, dealer])
  }

  function showAlert(msg){
    $('#alert span').html(`<strong>${msg}</strong>`)
    $('#alert').fadeIn();
  }

  function setActions(opts){
    let hand = player.getHand();

    if(!running){
      $('#deal').prop('disabled', false);
      $('#hit').prop('disabled', true);
      $('#stand').prop('disabled', true);
      $('#double').prop('disabled', true);
      $('#split').prop('disabled', true);
      $('#insurance').prop('disabled', true);
    }

    if(opts === 'run'){
      $('#deal').prop('disabled', true);
      $('#hit').prop('disabled', false);
      $('#stand').prop('disabled', false);

      if(player.checkWager(wager * 2)){
        $('#double').prop('disabled', false);
      }
    }else if (opts === 'split'){
      $('#split').prop('disabled', false);
    }else if (opts === 'insurance'){
      $('#insurance').prop('disabled', false);
    }else if(hand.length > 2){
      $('#double').prop('disabled', true);
      $('#split').prop('disabled', true);
      $('#insurance').prop('disabled', true);
    }
  }

  function Game(){
    this.newGame = function(){
      let wager = $.trim($('#wager').val());

      player.resetWager();
      player.setWager(wager);

      if(player.checkWager()){
        $('#deal').pop('disabled', true);
        resetBoard();
        player.setCash(-wager);

        deal = new Deal();
        running = true;
        blackjack = false;
        insured = false;

        player.resetHand();
        dealer.resetHand();
        showBoard();
      }else{
        player.setWager(-wager);
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        showAlert('Wager cannot exceed available cash')
      }

    }
  }

  function renderCard(ele, sender, type, item){
    let hand, i, card;

    if(!item){
      hand = sender.getHand();
      i = hand.length - 1;
      card = new Card(hand[i]);
    }else {
      hand = dealer.getHand();
      card= new Card(hand[1])
    }

    let rank = card.getRank(),
        suit = card.getSuit(),
        color = 'red',
        posx = 402,
        posy = 182,
        speed = 200,
        cards = ele + ' .card=' + i;

    if(i > 0){
      posx -= 50 * i;
    }

    if(!item){
      $(ele).append(
        `<div class='card-${i} ${type}'>
          <span class='pos-0'>
            <span class='rank'>&nbsp;</span>
            <span class='suit'>&nbsp;</span>
          </span>
          <span class='pos-1'>
            <span class='rank'>&nbsp;</span>
            <span class='suit'>&nbsp;</span>
          </span>
        </div>`
      )
    }
  }


  $('#deal').on('cllick', function(){
    let cash = parseInt(player.getCash());

    $('#alert').fadeOut();

    if(cash > 0 && !running){
      if($.trim($('#wager').val()) > 0){
        game.newGame();
      }else{
        $('#alert').removeClass('alert-info alert-success').addClass('alert-error');
        SpeechRecognitionAlternative('The minimum bet is $1.')
      }
    }else{
      $('#myModal').modal();
    }
  });

  $('#hit').on('click', function(){
    player.hit()
  })

  $('#stand').on('click', function(){
    player.stand()
  })

  $('#double').on('click', function(){
    player.double()
  })

  $('#split').on('click', function(){
    player.split()
  })

  $('#insurance').on('click', function(){
    player.insurance()
  })

  $('#wager').numOnly();
  $('#actions:not(#wager), #game, #myModal').disableSelection();
  $('#newGame, #cancel').on('click', function(e){
    e.preventDefualt();
  });
  $('#cancel').on('click', function(){
    $('#myModal').modal('hide');
  })
  $('#wager').val(100);
  $('#cash span').html(player.getCash());
  player.getBank();
});