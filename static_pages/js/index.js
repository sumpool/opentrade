'use strict';

//var g_CurrentPair = utils.DEFAULT_PAIR;
var g_CurrentLang = 'ru';

var g_bFirstChatFilling = true;
const chat_languages = ['ru', 'en'];

var coinNameToTicker = {};
var coinTickerToName = {};

const datatables = {};

var g_role = 'User';

function UpdatePageWithRole()
{
  if (!g_role || g_role == 'User')
    return;

  if (g_role == 'root')
  {
    $('.del_message_button').show();
    $('.del_order_button').show();
  }
  if (g_role == 'Support')
    $('.staff_area').show();
  if (g_role == 'Chat-admin')
  {
    $('.del_message_button').show();
    $('.chat_admin_area').show();
  }
}

function getBaseTicker()
{
  return coinNameToTicker && coinNameToTicker[utils.getMainCoin()] ? coinNameToTicker[utils.getMainCoin()].ticker || 'SUM' : 'SUM';
}

function IsNeadScroll()
{
  if (g_bFirstChatFilling)
    return true;

  const container = $('#chat-container_'+g_CurrentLang);

  return container[0].clientHeight + container.offset().top - container[0].offsetTop < 500;
};

$(() => {
  if (RedirectToCurrentPair())
      return;

  const filter = storage.getItem("coinFilter");
  if (filter && filter.value)
    $('#filter_ticker').val(filter.value);
  //$('#active_orders').fixedHeaderTable({ footer: false, cloneHeadToFoot: false, fixedColumn: false });

  utils.CreateSocket(onSocketMessage, onOpenSocket);

  for (var i=0; i<chat_languages.length; i++)
    $('#chat-container_'+chat_languages[i]).hide();

  $('#button_chat').click(event => {
        event.preventDefault();
        SendChatMessage();
  });

  UpdateBuySellText();

  setInterval(IsNeadScroll, 5000);
  setInterval(UpdateHelpers, 10000);

  $('.staff_area').hide();
  $('.chat_admin_area').hide();

  $('#table_active_orders').DataTable({
      scrollY: 350,
      scrollCollapse: true,
      paging: false,
      searching: false,
      ordering: false,
      info: false
  });
  $('#table_user_history').DataTable({
      scrollY: 350,
      scrollCollapse: true,
      paging: false,
      searching: false,
      ordering: false,
      info: false
  });
  datatables['history'] = $('#table_all_history').DataTable({
      scrollY: 350,
      scrollCollapse: true,
      paging: false,
      searching: false,
      ordering: false,
      info: false
  });
  // datatables['market'] = $('#table_market').DataTable({
  //       scrollY: 360,
  //       scrollX: true,
  //       scrollCollapse: true,
  //       paging: false,
  //       searching: false,
  //       ordering: false,
  //       info: false
  // });

  if (utils.getMainCoin() == 'Sumcoin')
    $('#SUM_market').removeClass('btn-outline-primary').addClass('btn-primary').attr("disabled", true);
  if (utils.getMainCoin() == 'Bitcoin')
    $('#BTC_market').removeClass('btn-outline-primary').addClass('btn-primary').attr("disabled", true);
  if (utils.getMainCoin() == 'Dogecoin')
    $('#DOGE_market').removeClass('btn-outline-primary').addClass('btn-primary').attr("disabled", true);
  if (utils.getMainCoin() == 'Litecoin')
    $('#LTC_market').removeClass('btn-outline-primary').addClass('btn-primary').attr("disabled", true);
  if (utils.getMainCoin() == 'Mooncoin')
    $('#MOON_market').removeClass('btn-outline-primary').addClass('btn-primary').attr("disabled", true);


});

let bFirstTimeTabShow = true
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  e.target // newly activated tab
  e.relatedTarget // previous active tab

  if (bFirstTimeTabShow)
    $('#table_user_history').css('width', '100%').dataTable().fnAdjustColumnSizing();
  bFirstTimeTabShow = false;

})

$('#SUM_market').on('click', e => {
  e.preventDefault();
  if (utils.getMainCoin() == 'Sumcoin') return;
  utils.setMainCoin('Sumcoin');

  const BTC = coinNameToTicker[utils.getCurrentPair()].ticker;
  const pair = (BTC == 'SUM') ? 'DOGE' : BTC;

  utils.ChangeUrl(document.title + "(" + utils.getCurrentPair() + ' market)', '/market/SUM-'+pair);
  location.reload();
});

$('#BTC_market').on('click', e => {
  e.preventDefault();
  if (utils.getMainCoin() == 'Bitcoin') return;
  utils.setMainCoin('Bitcoin');
  //RedirectToCurrentPair();
  //const SUM = coinNameToTicker[utils.getCurrentPair()].ticker;
  const pair = 'SUM' //(SUM == 'BTC') ? 'SUM' : SUM;

  utils.ChangeUrl(document.title + "(" + utils.getCurrentPair() + ' market)', '/market/BTC-'+pair);
  location.reload();
});
$('#DOGE_market').on('click', e => {
  e.preventDefault();
  if (utils.getMainCoin() == 'Dogecoin') return;
  utils.setMainCoin('Dogecoin');
  // RedirectToCurrentPair();
  // const SUM = coinNameToTicker[utils.getCurrentPair()].ticker;
  const pair = 'SUM'//(SUM == 'DOGE') ? 'SUM' : SUM;

  utils.ChangeUrl(document.title + "(" + utils.getCurrentPair() + ' market)', '/market/DOGE-'+pair);
  location.reload();
});

$('#LTC_market').on('click', e => {
  e.preventDefault();
  if (utils.getMainCoin() == 'Litecoin') return;
  utils.setMainCoin('Litecoin');
  // RedirectToCurrentPair();

  // const SUM = coinNameToTicker[utils.getCurrentPair()].ticker;
  const pair = 'SUM'// (SUM == 'LTC') ? 'SUM' : SUM;

  utils.ChangeUrl(document.title + "(" + utils.getCurrentPair() + ' market)', '/market/LTC-'+pair);
  location.reload();
});

$('#MOON_market').on('click', e => {
  e.preventDefault();
  if (utils.getMainCoin() == 'Mooncoin') return;
  utils.setMainCoin('Mooncoin');
  // RedirectToCurrentPair();

  // const SUM = coinNameToTicker[utils.getCurrentPair()].ticker;
  const pair = 'SUM'// (SUM == 'LTC') ? 'SUM' : SUM;

  utils.ChangeUrl(document.title + "(" + utils.getCurrentPair() + ' market)', '/market/MOON-'+pair);
  location.reload();
});


$('#inputBuyTotal').change(e => {
  UpdateBuyComissionFromTotal();
});

$('#inputSellTotal').change(e => {
  UpdateSellComissionFromTotal();
});
function UpdateBuySellText()
{
  $('#header_sell').text('Sell '+utils.getCurrentPair());
  $('#header_buy').text('Buy '+utils.getCurrentPair());

  const token = $('#id_token').val();
  if (!token || !token.length)
  {
    $('#id_balance_spiner1').hide();
    $('#id_balance_spiner2').hide();
    $('#id_sell_balance').text("0");
    $('#id_buy_balance').text("0");
  }

  $('#id_buy_coin').text(utils.getMainCoin());
  $('#id_sell_coin').text(utils.getCurrentPair());

}

function ShowLanguageChat()
{
  $('#chat-container_loading').hide();
  g_CurrentLang = utils.GetCurrentLang();

  const neadScroll = IsNeadScroll(); //true; //IsNeadScroll();

  for (var i=0; i<chat_languages.length; i++)
  {
    $('#chat-container_'+chat_languages[i]).hide();
  }

  $('#chat-container_'+g_CurrentLang).show();
  UpdatePageWithRole();

  if (neadScroll)
    $('#chat-flex').animate({scrollTop: $('#chat-container_'+g_CurrentLang).height()}, 0);

}

$('#id_btn_chat_ru').on('click', e => {
  storage.setItem('CurrentLang', 'ru');
  ShowLanguageChat();
});

$('#id_btn_chat_en').on('click', e => {
  storage.setItem('CurrentLang', 'en');
  ShowLanguageChat();
});

$('#form_buy').submit(e => {
  e.preventDefault();

  try
  {
    const amount = $('#inputBuyAmount').val()*1;
    const price = $('#inputBuyPrice').val()*1;

    const order = {order: 'buy', base: utils.getMainCoin(), coin: utils.getCurrentPair(), amount: amount, price: price};
    AddOrder(order);
  }
  catch(e)
  {}

});

$('#form_sell').submit(e => {
  e.preventDefault();

  try
  {
    const amount = $('#inputSellAmount').val()*1;
    const price = $('#inputSellPrice').val()*1;

    const order = {order: 'sell', base: utils.getMainCoin(), coin: utils.getCurrentPair(), amount: amount, price: price};
    AddOrder(order);
  }
  catch(e)
  {}

});

function AddOrder(order)
{
  order.amount = (order.amount*1).toFixed(5);
  const MC = getBaseTicker();
  const bodyModal =
    '<table class="table">'+
      '<tr>'+
        '<th>Order</th>'+
        '<th>Amount</th>'+
        '<th>Coin</th>'+
        '<th>Price</th>'+
      '</tr>'+
      '<tr>'+
        '<td>'+order.order+'</td>'+
        '<td>'+utils.MakePrice3(order.amount)+'</td>'+
        '<td>'+order.coin+'</td>'+
        '<td>'+utils.MakePrice3(order.price)+" "+MC+'</td>'+
      '</tr>'
    '</table>';

  modals.OKCancel("Order confirmation", bodyModal, ret => {
    if (ret != 'ok')
      return;

    $('#loader').show();
    $("html, body").animate({ scrollTop: 0 }, "slow");
    $.post( "/submitorder", order, function( data ) {
        $('#loader').hide();
        if (data.result != true)
        {
          utils.alert_fail(data.message);
          return;
        }
        utils.alert_success('Your order is submitted!');
        socket.send(JSON.stringify({request: 'getpair', message: [utils.getMainCoin(), utils.getCurrentPair()]}));
    }, "json" );
  });

}

function SendChatMessage()
{
  socket.send(JSON.stringify({request: 'postchat', message: {text: $('#chat_message').val(), lang: g_CurrentLang}}));
  $('#chat_message').val('');
}

function onOpenSocket()
{
  socket.send(JSON.stringify({request: 'getchat'}));
  //socket.send(JSON.stringify({request: 'getchart', message: [utils.MAIN_COIN, g_CurrentPair, g_currentChartPeriod]}));
  socket.send(JSON.stringify({request: 'getpair', message: [utils.getMainCoin(), utils.getCurrentPair()]}));

  socket.send(JSON.stringify({request: 'getrole'}))

  setInterval(()=>{socket.send(JSON.stringify({request: 'getpair', message: [utils.getMainCoin(), utils.getCurrentPair()]}));}, 5000)
  //setInterval(() => {  socket.send(JSON.stringify({request: 'getchart', message: [utils.MAIN_COIN, g_CurrentPair, g_currentChartPeriod]}));}, 60000)
}

function onSocketMessage(event)
{
  var data = {};
  try { data = JSON.parse(event.data); }
  catch(e) {return;}

  if (!data.request || data.request == 'error' || !data.message)
    return;

  if (data.request == 'chat-message')
    return AddChatMessage(data.message)

  if (data.request == 'user-role')
  {
    g_role = data.message;
    return UpdatePageWithRole();
  }
  if (data.request == 'chat-messages')
  {
    //$('#chat-container').empty();

    const messagesAll = data.message || [];
    ShowLanguageChat();

    return setTimeout(AsyncAddChatMessage, 0, messagesAll, messagesAll.length-1);
  }
  if (data.request == 'pairdata')
    return UpdatePairData(data.message)

  if (data.request == 'pairbalance')
    return UpdatePairBalance(data.message)

  if (data.request == 'wallet')
    return UpdateBalance(data.message);

  if (data.request == 'market')
    return UpdateMarket(data.message)

  if (data.request == 'exchange-updated')
    return UpdateExchange(data.message);
}

function AsyncAddChatMessage(messages, index)
{
  if (index < 0)
    return g_bFirstChatFilling = false;

  AddChatMessage(messages[index], true, 'prepend');
  setTimeout(AsyncAddChatMessage, 0, messages, index-1);
}

function UpdateExchange(message)
{
  if (!message || !message.coin || message.coin != utils.getCurrentPair())
    return;

  socket.send(JSON.stringify({request: 'getpair', message: [utils.getMainCoin(), utils.getCurrentPair()]}));
}

function  RedirectToCurrentPair()
{
  /*const currentPair = storage.getItemS('CurrentPair');
  if (currentPair != null)
    g_CurrentPair = currentPair.value;*/

  const coinNameToTickerItem = storage.getItem('coinNameToTicker');
  const coinTickerToNameItem = storage.getItem('coinTickerToName');

  if (coinNameToTickerItem != null) coinNameToTicker = coinNameToTickerItem.value;
  if (coinTickerToNameItem != null) coinTickerToName = coinTickerToNameItem.value;

  const uri = window.location.href.split("?")[0];
  const posMarket  = uri.indexOf('/market/');
  const pair = (posMarket == -1 && uri.split("-").length == 2) ?
    coinNameToTicker[utils.getCurrentPair()].ticker :
    uri.split("-")[1];

  if (coinNameToTicker[utils.getCurrentPair()] && coinTickerToName[pair] && pair != coinNameToTicker[utils.getCurrentPair()].ticker)
  {
    storage.setItemS('CurrentPair', coinTickerToName[pair].name);
    location.reload();
    return true;
  }
  return false;
}

let g_lastMarketMessage = null;
//let lastupdated = 0;
let g_LastPrices = {};
let g_LastVolumes = {};
//let b_firstTimeMarket = true;
function UpdateMarket(message)
{
  const MC = getBaseTicker();
  //if (Date.now() - lastupdated < 50000) return;
 // lastupdated = Date.now();

  if (!message || !message.coins || !message.coins.length)
    return;

  g_lastMarketMessage = message;
  const filter = $('#filter_ticker').val();

  $('#table-market').empty();
  let markets = [];
  for (var i=0; i<message.coins.length; i++)
  {
    const coinName = unescape(message.coins[i].name);
    const coinIcon = '<img style="float:left;" width="16px" src="'+unescape(message.coins[i].icon)+'" />';

    coinNameToTicker[coinName] = {ticker: message.coins[i].ticker};
    coinTickerToName[message.coins[i].ticker] = {name: coinName};

    if (coinName == utils.getMainCoin())
      continue;
    if (message.coins[i].base && message.coins[i].base != utils.getMainCoin())
      continue;
    if (filter.length && message.coins[i].ticker.toUpperCase().indexOf(filter.toUpperCase()) == -1)
      continue;

    const price = (message.coins[i].fromBuyerToSeller/(message.coins[i].volume == 0 ? 1 : message.coins[i].volume)).toFixed(8)*1;
    const vol = (message.coins[i].volume*1).toFixed(8)*1;
    const ch = message.coins[i].prev_frombuyertoseller ? ((price - message.coins[i].prev_frombuyertoseller*1) / (price != 0 ? price : 1))*100 : 100;

    const chColor = ch*1 < 0 ? "text-danger" : "text-success";

    if (coinName == 'Bitcoin')
    {
      /*g_MC_BTC_Price = price;
      setTimeout(UpdateMCFromLB, 1);*/
      storage.setItem("MC_BTC_Price", price);
    }

    const BTC = coinNameToTicker[coinName].ticker;

    const prevPrice = g_LastPrices[MC+'-'+BTC] || 0;
    g_LastPrices[MC+'-'+BTC] = price;

    const prevVolume = g_LastVolumes[MC+'-'+BTC] || 0;
    g_LastVolumes[MC+'-'+BTC] = vol;

    const rowClass =
      (prevVolume*1 != vol*1) ? (ch*1 < 0 ? "table-danger" : "table-success") :
      prevPrice == 0 ? "" :
      prevPrice*1 > price*1 ? "table-success" :
      prevPrice*1 < price*1 ? "table-danger" : "";
    const tr = $('<tr class="'+rowClass+'"></tr>')
      .append($('<td class="align-middle" style= "padding: 0.1rem">'+coinIcon+'</td>'))
      .append($('<td class="align-middle" style= "padding: 0.1rem">'+message.coins[i].ticker+'</td>'))
      .append($('<td class="align-middle" style= "padding: 0.1rem">'+utils.MakePrice3(price)+'</td>'))
      //.append($('<td class="align-middle">'+utils.MakePrice3(vol)+'</td>'))
      .append($('<td class="align-middle style= "padding: 0.1rem""><span class="'+chColor+'">'+(ch*1).toFixed(2)+'</span></td>'))
      .css( 'cursor', 'pointer' )
      .on('click', e => {
        if (coinName == utils.getCurrentPair())
          return;

        utils.ChangeUrl(document.title + "(" + coinName + ' market)', '/market/'+MC+'-'+BTC);
        storage.setItemS('CurrentPair', coinName);
        location.reload();
      });

    //$('#table-market').append(tr);
    if (BTC == "USD")
      markets.unshift(tr);
    else
      markets.push(tr);
  }

  for (let j=0; j<markets.length; j++)
    $('#table-market').append(markets[j]);

  storage.setItem('coinNameToTicker', coinNameToTicker);
  storage.setItem('coinTickerToName', coinTickerToName);

  if (RedirectToCurrentPair())
    return;

  if (!$('#id_buy_orders_header_price').length)
  {
    $('#id_buy_orders_header').append($('<th id="id_buy_orders_header_price">Price</th><th>'+getBaseTicker()+'</th><th>'+coinNameToTicker[utils.getCurrentPair()].ticker+'</th>'))
    $('#id_sell_orders_header').append($('<th>Price</th><th>'+getBaseTicker()+'</th><th>'+coinNameToTicker[utils.getCurrentPair()].ticker+'</th>'))

    $('#table_buy_orders').DataTable({
      scrollY: 350,
      scrollCollapse: true,
      paging: false,
      searching: false,
      ordering: false,
      info: false
    });
    $('#table_sell_orders').DataTable({
      scrollY: 350,
      scrollCollapse: true,
      paging: false,
      searching: false,
      ordering: false,
      info: false
    });

  }

  UpdateBuySellTickers();

  const BTC = coinNameToTicker[utils.getCurrentPair()].ticker;

  utils.ChangeUrl(document.title + "(" + utils.getCurrentPair()+' market)', '/market/'+MC+'-'+BTC+(window.location.search || ""));

 // if (datatables['market'].columns)
   // datatables['market'].columns.adjust();
}

function UpdateBuySellTickers()
{
  if (!coinNameToTicker[utils.getCurrentPair()])
    return;

  const MC = getBaseTicker();
  const BTC = coinNameToTicker[utils.getCurrentPair()].ticker;

  $('#id_amount_buy').text(BTC);
  $('#id_amount_sell').text(BTC);

  $('#id_price_buy').text(MC);
  $('#id_price_sell').text(MC);

  $('#id_comission_buy').text(MC);
  $('#id_comission_sell').text(MC);

  $('#id_total_buy').text(MC);
  $('#id_total_sell').text(MC);

}

function IsIgnoredUser(user)
{
  const saved = storage.getItem('ignore_'+user);
  if (!saved || !saved.value || saved.value != 'true') return false;

  return true;
}

let prevUser = "";
function AddChatMessage(message, noscroll, method)
{
  const userName = unescape(message.user);
  const user = $('<a href="#"></a>').text(userName+":");
  const text = $('<span class="p-2"></span>').text(message.message.text);

  const bIgnoredUser = IsIgnoredUser(userName);

  if (bIgnoredUser && prevUser == userName)
    return;
  prevUser = userName;

  const ignorButton = $('<a href="#" title="Ignore this user" style="text-decoration: none">&#10006;&nbsp</a>')
    .on('click', e => {
      e.preventDefault();
      storage.setItem('ignore_'+userName, 'true');
      location.reload();
    });
  const unignorButton = $('<a href="#" title="Ignored user" style="text-decoration: none">&#9785;&nbsp</a>')
    .on('click', e => {
      e.preventDefault();
      storage.setItem('ignore_'+userName, 'false');
      location.reload();
    });
  const privMessage = $('<a href="#" style="text-decoration: none">&#9743;&nbsp</a>')
  const delButton = $('<a href="#" title="Delete message" class="del_message_button" style="text-decoration: none">&#10006;&nbsp</a>').hide();
  const banButton = $('<a href="#" title="Ban user" class="del_message_button" style="text-decoration: none">&#9760;&nbsp</a>').hide();

  if (!message.message.lang)
    return;

  privMessage.on('click', e => {
    e.preventDefault();
  });

  let oldMessage = message;
  delButton.on('click', e => {
    e.preventDefault();

    modals.OKCancel("Confirmation", $('<p>'+"Delete message: '"+oldMessage.message.text+"'"+'</p>'), ret => {
      if (ret != 'ok')
        return;

      socket.send(JSON.stringify({request: 'del_chat_message', message: oldMessage}));
    });
  });
  banButton.on('click', e => {
    e.preventDefault();
    modals.OKCancel("Confirmation", $('<p>'+"Ban user: '"+oldMessage.user+"'"+'</p>'), ret => {
      if (ret != 'ok')
        return;

      oldMessage['info'] = {endTime: Date.now()+1000*60*60*24*365, comment: {role: g_role, comment: 'User '+oldMessage.user+' banned on 365 days'}};
      socket.send(JSON.stringify({request: 'ban_chat_user', message: oldMessage}));
    });
  });

  user.on('click', e => {
    e.preventDefault();
    const old = $('#chat_message').val();
    $('#chat_message').val(old + userName + ", ");
  });

  const append = method || 'append';

  const row = !bIgnoredUser ?
    $('<div class="row chat_row"></div>').append($('<div class="col-md-12"></div>')
      .append(banButton)
      .append(user)
      .append(text)
      .append(delButton)) :
    $('<div class="row chat_row"></div>').append($('<div class="col-md-12"></div>')
      .append(banButton)
      .append(unignorButton))
      ;



  $('#chat-container_'+message.message.lang)[append](row);

  ShowLanguageChat();
}

function UpdatePairData(message)
{
  if (!message || !message.result || !message.data)
    return;

  if (message.data.orders)
    UpdateOrders(message.data.orders);
  if (message.data.userOrders)
    UpdateUserOrders(message.data.userOrders);
  if (message.data.history)
    UpdateTradeHistory(message.data.history);
  if (message.data.historyUser)
    UpdateTradeHistoryUser(message.data.historyUser);

  let chatHeader = "<span>Chat</span>";
  if (message.data.online != undefined)
    chatHeader = '<span>Online: </span><strong>'+message.data.online+'</strong>';
    //$('#id_chat_header').html('<span>Online: </span><strong>'+message.data.online+'</strong>')
  if (message.data.allusers != undefined && message.data.allusers > 0)
    chatHeader = '<span>Online: </span><strong>'+message.data.online+'</strong>&nbsp&nbsp(Registered: '+ message.data.allusers +')';

  $('#id_chat_header').html(chatHeader);
}

function UpdatePairBalance(message)
{

}

function UpdateTradeHistory(history)
{
  $('#id_trade_history').empty();
  for (var i=0; i<history.length; i++)
  {
    if (!history[i].time || history[i].volume*1 == 0)
      continue;

    history[i].buysell = history[i].buysell == 'sell' ? 'buy' : 'sell';

    const typeColor = history[i].buysell == 'sell' ? "text-danger" : "text-success";

    const volume = utils.MakePrice(history[i].volume);
    const price = utils.MakePrice((history[i].fromBuyerToSeller/history[i].volume).toFixed(8));

    const tr = $('<tr></tr>')
      .append($('<td>'+utils.timeConverter(history[i].time*1)+'</td>'))
      .append($('<td><span class="'+typeColor+'">'+history[i].buysell+'</span></td>'))
      .append($('<td>'+utils.MakePrice3(volume)*1+'</td>'))
      .append($('<td>'+utils.MakePrice3(price)+'</td>'));
//      .append($('<td>'+(history[i].volume*1).toFixed(8)*1+'</td>'))
//      .append($('<td>'+(history[i].fromBuyerToSeller/history[i].volume).toFixed(8)*1+'</td>'));

    $('#id_trade_history').append(tr);
  }
}

function UpdateTradeHistoryUser(history)
{
  $('#id_user_orders_history').empty();
  for (var i=0; i<history.length; i++)
  {
    if (!history[i].time || history[i].volume*1 == 0)
      continue;

    //history[i].buysell = history[i].buysell == 'sell' ? 'buy' : 'sell';

    const typeColor = history[i].buysell == 'sell' ? "text-danger" : "text-success";
    const tr = $('<tr></tr>')
      .append($('<td>'+utils.timeConverter(history[i].time*1)+'</td>'))
      .append($('<td><span class="'+typeColor+'">'+history[i].buysell+'</span></td>'))
      .append($('<td>'+utils.MakePrice3(history[i].volume)+' ' +  coinNameToTicker[utils.getCurrentPair()].ticker + '</td>'))
      .append($('<td>'+utils.MakePrice3(history[i].fromBuyerToSeller/history[i].volume)+ ' ' +  getBaseTicker() +'</td>'));

    $('#id_user_orders_history').append(tr);
  }
}

function UpdateOrders(orders)
{
  if (!orders.buy || !orders.sell)
    return;

  $('#id_buy_orders_body').empty();
  $('#id_sell_orders_body').empty();

  var volumeBuy = 0.0;
  var volumeBuyPair = 0.0;
  for (var i=0; i<orders.buy.length; i++)
  {
    const price = utils.MakePrice3(orders.buy[i].price);//(orders.buy[i].price*1.0).toFixed(8)*1;
    const amountMain = utils.MakePrice3(orders.buy[i].price*orders.buy[i].amount); //(orders.buy[i].price*orders.buy[i].amount*1.0).toFixed(8)*1;
    const amountPair = utils.MakePrice3(orders.buy[i].amount); //(orders.buy[i].amount*1.0).toFixed(8)*1;

    const delButton = $('<a href="#" title="Delete orders" class="del_order_button" style="text-decoration: none">&#10006;&nbsp</a>').hide();
    delButton.on('click', e => {
      e.preventDefault();
      socket.send(JSON.stringify({request: 'del_orders', message: {coinName: utils.getCurrentPair(), price: price}}));
    });

    const tr = $('<tr></tr>')
      .append($('<td>'+price+'</td>'))
      .append($('<td>'+amountMain+'</td>'))
      .append($('<td>'+amountPair+'</td>'))
      .append(delButton);

    volumeBuy += amountMain*1;
    volumeBuyPair += amountPair*1;

    const curVolumeBuy = utils.MakePrice3(volumeBuy*1.0);
    const curVolumePair = utils.MakePrice3(volumeBuyPair*1.0);

    tr.on('click', e => {
      $('#inputSellAmount').val(curVolumePair);
      $('#inputSellPrice').val(price);
      UpdateSellComission();
    });


    $('#id_buy_orders_body').append(tr);
  }

  if (orders.volumes && orders.volumes.length && orders.volumes[0].sum_amount_price)
    volumeBuy = orders.volumes[0].sum_amount_price

  $('#id_buy_volume').text(" " + (volumeBuy*1).toFixed(8)*1+" "+getBaseTicker());

  var volumeSell = 0.0;
  var volumeSellPair = 0.0;
  for (var i=0; i<orders.sell.length; i++)
  {
    const price = utils.MakePrice3(orders.sell[i].price); //(orders.sell[i].price*1.0).toFixed(8)*1;
    const amountMain = utils.MakePrice3(orders.sell[i].price*orders.sell[i].amount); //(orders.sell[i].price*orders.sell[i].amount*1.0).toFixed(8)*1;
    const amountPair = utils.MakePrice3(orders.sell[i].amount); //(orders.sell[i].amount*1.0).toFixed(8)*1;

    const delButton = $('<a href="#" title="Delete orders" class="del_order_button" style="text-decoration: none">&#10006;&nbsp</a>').hide();
    delButton.on('click', e => {
      e.preventDefault();
      socket.send(JSON.stringify({request: 'del_orders', message: {coinName: utils.getCurrentPair(), price: price}}));
    });

    const tr = $('<tr></tr>')
      .append($('<td>'+price+'</td>'))
      .append($('<td>'+amountMain+'</td>'))
      .append($('<td>'+amountPair+'</td>'))
      .append(delButton);

    volumeSell += amountPair*1;
    volumeSellPair += amountMain*1;

    const curVolumeSell = utils.MakePrice3(volumeSell*1.0);
    const curVolumePair = utils.MakePrice3(volumeSellPair*1.0);

    tr.on('click', e => {
      $('#inputBuyAmount').val(curVolumeSell);
      $('#inputBuyPrice').val(price);
      UpdateBuyComission();
    });


    $('#id_sell_orders_body').append(tr);
  }

  if (orders.volumes && orders.volumes.length>1 && orders.volumes[1].sum_amount)
    volumeSell = orders.volumes[1].sum_amount

  $('#id_sell_volume').text(" " + (volumeSell*1).toFixed(8)*1+" "+coinNameToTicker[utils.getCurrentPair()].ticker);

  if (!orders.buy.length)
    orders.buy = [{price: 0.0}];
  if (!orders.sell.length)
    orders.sell = [{price: 0.0}];

  const txtBuyPrice = utils.MakePrice3(orders.buy[0].price);
  const txtSellPrice = utils.MakePrice3(orders.sell[0].price);

  const askButton = $('<button id="button_max_ask" type="button" class="p-0 btn btn-link"></button>').append(txtBuyPrice).on('click', e => {
        $('#inputBuyPrice').val(txtBuyPrice);
      })
  const bidButton = $('<button id="button_max_bid"type="button" class="p-0 btn btn-link"></button>').append(txtSellPrice).on('click', e => {
        $('#inputSellPrice').val(txtSellPrice);
      })

  $('#id_max_bid').empty().append(bidButton); //.text(utils.MakePrice(orders.buy[0].price)); //((orders.buy[0].price*1.0).toFixed(8)*1);
  $('#id_max_ask').empty().append(askButton); //.text(utils.MakePrice(orders.sell[0].price)); //((orders.sell[0].price*1.0).toFixed(8)*1);

  if ($('#inputSellPrice').val().length == 0) $('#inputSellPrice').val($('#id_max_bid').text());
  if ($('#inputBuyPrice').val().length == 0) $('#inputBuyPrice').val($('#id_max_ask').text());

  $('#id_max_bid_coin').text(utils.getMainCoin());
  $('#id_max_ask_coin').text(utils.getMainCoin());

  UpdatePageWithRole();

}

function UpdateUserOrders(userOrders)
{
  $('#id_user_orders').empty();

  for (var i=0; i<userOrders.length; i++)
  {
    if (unescape(userOrders[i].coin) != utils.getCurrentPair() || unescape(userOrders[i].price_pair) != utils.getMainCoin())
      continue;

    const orderID = userOrders[i].id;

    //const close = $('<button type="button" class="btn btn-primary btn-sm">X</button>').on('click', e => {
    const close = $('<a href="#" title="Delete order" class="del_order_button" style="text-decoration: none">&#10006;&nbsp</a>').on('click', e => {
      e.preventDefault();
      $('#loader').show();
      $("html, body").animate({ scrollTop: 0 }, "slow");
      $.post( "/closeorder", {orderID: orderID}, function( data ) {
        $('#loader').hide();
        if (data.result != true)
        {
          utils.alert_fail(data.message);
          return;
        }
        utils.alert_success('Your order is closed!');
        socket.send(JSON.stringify({request: 'getpair', message: [utils.getMainCoin(), utils.getCurrentPair()]}));
      }, "json" );
    });

    const typeColor = userOrders[i].buysell == 'sell' ? "text-danger" : "text-success";
    const tr = $('<tr></tr>')
      .append($('<td>'+utils.timeConverter(userOrders[i].time*1)+'</td>'))
      .append($('<td><span class="'+typeColor+'">'+userOrders[i].buysell+'</span></td>'))
      .append($('<td>'+utils.MakePrice3(userOrders[i].amount*1)*1+' '+coinNameToTicker[utils.getCurrentPair()].ticker+'</td>'))
      .append($('<td>'+utils.MakePrice3(userOrders[i].price*1)+" "+userOrders[i].price_pair+'</td>'))
      .append($('<td></td>').append(close));

    $('#id_user_orders').append(tr);
  }
}

function UpdateBalance(message)
{
  var buyBalance = $('#buy_balance_button').text(); //$('#inputSellAmount').val();
  var sellBalance = $('#sell_balance_button').text(); //$('#inputSellAmount').val();

  if (!buyBalance.length) buyBalance = 0.0;
  if (!sellBalance.length) sellBalance = 0.0;

  if (message.coin && (message.balance != undefined))
  {
    if (unescape(message.coin.name) == utils.getMainCoin())
    {
      $('#id_balance_spiner1').hide();
      $('#id_buy_balance').empty();
      buyBalance = (message.balance*1.0).toFixed(7)*1; //message.balance*1 != 0 ? (message.balance*1.0).toFixed(8)*1 : buyBalance;
      if (buyBalance*1 <= 0) buyBalance = 0.0;

      const txtBalance = buyBalance;
      const balanceButton = $('<button id="buy_balance_button" type="button" class="p-0 btn btn-link"></button>').append(txtBalance).on('click', e => {
        $('#inputBuyTotal').val(txtBalance);
        UpdateBuyComissionFromTotal();
        //UpdateBuyComissionFromBalance(txtBalance);
      })

      $('#id_buy_balance').append(balanceButton); //.text(buyBalance);
      //$('#id_buy_coin').text(utils.MAIN_COIN);
    }
    if (unescape(message.coin.name) == utils.getCurrentPair())
    {
      $('#id_balance_spiner2').hide();
      $('#id_sell_balance').empty();
      sellBalance = (message.balance*1.0).toFixed(7)*1; // message.balance*1 != 0 ? (message.balance*1.0).toFixed(8)*1 : sellBalance;
      if (sellBalance*1 <= 0) sellBalance = 0.0;

      const txtBalance = sellBalance;
      const balanceButton = $('<button id="sell_balance_button" type="button" class="p-0 btn btn-link"></button>').append(txtBalance).on('click', e => {
        $('#inputSellAmount').val(txtBalance);
        UpdateSellComission();
      })

      $('#id_sell_balance').append(balanceButton); //.text(sellBalance);
      //$('#id_sell_coin').text(g_CurrentPair);
    }
  }
}

$('#inputBuyAmount').on('change', e => {
  UpdateBuyComission();
})
$('#inputBuyPrice').on('change', e => {
  UpdateBuyComission();
})
$('#inputSellAmount').on('change', e => {
  UpdateSellComission();
})
$('#inputSellPrice').on('change', e => {
  UpdateSellComission();
})


$('#filter_ticker').on('keyup', e => {
  storage.setItem("coinFilter", $('#filter_ticker').val());
  if (!g_lastMarketMessage) return;
  UpdateMarket(g_lastMarketMessage);
})

function UpdateBuyComission()
{
  const amount = $('#inputBuyAmount').val() || 0;
  const price = $('#inputBuyPrice').val() || 0;
  try
  {
    const comission = utils.GetComission()*amount*price;
    const total = (amount*price+comission).toFixed(5)*1;
    //const comission = utils.GetComission()*amount;
    //const total = (amount+comission).toFixed(5)*1;
    $('#inputBuyComission').val(utils.MakePrice3(comission));
    $('#inputBuyTotal').val(utils.MakePrice3(total));
    $('#inputBuyTotal').attr('title', 'title');
  }
  catch(e) {}

  UpdateHelpers();
}

function UpdateBuyComissionFromBalance(balanceMC)
{
  const price = $('#inputBuyPrice').val()*1 || 0.0001;

  try
  {
    const amount = balanceMC / price;
    const comission = utils.GetComission()*amount;
    const total = (amount-comission).toFixed(5)*1;

    $('#inputBuyTotal').val(utils.MakePrice3(total));
    $('#inputBuyComission').val(utils.MakePrice3(comission));
    $('#inputBuyAmount').val(utils.MakePrice3(amount));
  }
  catch(e) {}

  UpdateHelpers();
}

function UpdateBuyComissionFromTotal()
{
  const total = $('#inputBuyTotal').val()*1 > 0.0001 ? $('#inputBuyTotal').val()*1 - 0.0001 || 0.0001 : 0;
  const price = $('#inputBuyPrice').val()*1 || 0.0001;
  try
  {
    const amount = (total / (price + utils.GetComission()*price)).toFixed(5)*1;
    const comission = utils.GetComission()*amount*price;
    //const amount = (total / (1 - 1*utils.GetComission())).toFixed(5)*1;
    //const comission = utils.GetComission()*amount;
    $('#inputBuyComission').val(utils.MakePrice3(comission));
    $('#inputBuyAmount').val(utils.MakePrice3(amount));
  }
  catch(e) {}

  UpdateHelpers();
}
function UpdateSellComissionFromTotal()
{
  const total = $('#inputSellTotal').val()*1 || 0.0001;
  const price = $('#inputSellPrice').val()*1 || 0.0001;
  try
  {
    const amount = (total / (price - utils.GetComission()*price)).toFixed(5)*1;
    const comission = utils.GetComission()*amount*price;
    $('#inputSellComission').val(utils.MakePrice3(comission));
    $('#inputSellAmount').val(utils.MakePrice3(amount));
  }
  catch(e) {}

  UpdateHelpers();

  /*const total = $('#inputSellTotal').val()*1 || 0.0001;
  try
  {
    const amount = (total / (1 + utils.GetComission())).toFixed(5)*1;
    const comission = utils.GetComission()*amount;
    $('#inputSellComission').val(utils.MakePrice3(comission));
    $('#inputSellAmount').val(utils.MakePrice3(amount));
  }
  catch(e) {}

  UpdateHelpers();*/

}

function UpdateSellComission()
{
  const amount = $('#inputSellAmount').val() || 0;
  const price = $('#inputSellPrice').val() || 0;
  try
  {
    const comission = utils.GetComission()*amount*price;
    const total = (amount*price-comission).toFixed(5)*1;
    //const comission = utils.GetComission()*amount;
    //const total = (amount*1+comission).toFixed(7)*1;
    $('#inputSellComission').val(utils.MakePrice3(comission));
    $('#inputSellTotal').val(utils.MakePrice3(total));
  }
  catch(e) {}

  UpdateHelpers();
}

function UpdateHelpers()
{
  const cntObject = storage.getItem('coinNameToTicker');
  if (cntObject == null || !cntObject.value)
      return;

  const coinNameToTicker = cntObject.value;

  const MC = getBaseTicker();

  const LB_data = storage.getItem('LB_DATA') != null &&  storage.getItem('LB_DATA').value ?
    storage.getItem('LB_DATA').value : false;

  if (!LB_data || !LB_data.USD || !LB_data.EUR || !LB_data.RUB) return;

  // SetHelper("inputSellTotal", MC, LB_data);
  // SetHelper("inputSellComission", MC, LB_data);
  // SetHelper("inputSellPrice", MC, LB_data);
  // SetHelper("inputBuyTotal", MC, LB_data);
  // SetHelper("inputBuyComission", MC, LB_data);
  // SetHelper("inputBuyPrice", MC, LB_data);
  // SetHelper("buy_balance_button", MC, LB_data);
  // SetHelper("button_max_ask", MC, LB_data);
  // SetHelper("button_max_bid", MC, LB_data);

  function SetHelper(name, MC, LB_data)
  {
    const total = $('#' + name).val() ? $('#' + name).val()*1 || 0 : $('#' + name).text()*1 || 0;

    const helper = " = " + utils.MakePrice2(LB_data.USD*total) + " USD = " + utils.MakePrice2(LB_data.EUR*total) + " EUR = " + utils.MakePrice2(LB_data.RUB*total) + " RUB";

    if (MC != 'BTC')
      $('#' + name).attr('title', utils.MakePrice2(total) + "  MC = " + utils.MakePrice2(LB_data.BTC*total) + " BTC" + helper);
    else
      $('#' + name).attr('title', utils.MakePrice2(total) +" MC =" + helper);
  }

}
