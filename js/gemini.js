'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, BadRequest, OrderNotFound, InvalidOrder, InvalidNonce, InsufficientFunds, AuthenticationError, PermissionDenied, NotSupported, OnMaintenance, RateLimitExceeded } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class gemini extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gemini',
            'name': 'Gemini',
            'countries': [ 'US' ],
            'rateLimit': 1500, // 200 for private API
            'version': 'v1',
            'has': {
                'fetchDepositAddress': false,
                'createDepositAddress': true,
                'CORS': false,
                'fetchBidsAsks': false,
                'fetchTickers': true,
                'fetchMyTrades': true,
                'fetchOrder': true,
                'fetchOrders': false,
                'fetchOpenOrders': true,
                'fetchClosedOrders': false,
                'createMarketOrder': false,
                'withdraw': true,
                'fetchTransactions': true,
                'fetchWithdrawals': false,
                'fetchDeposits': false,
                'fetchOHLCV': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27816857-ce7be644-6096-11e7-82d6-3c257263229c.jpg',
                'api': {
                    'public': 'https://api.gemini.com',
                    'private': 'https://api.gemini.com',
                    'web': 'https://docs.gemini.com',
                },
                'www': 'https://gemini.com/',
                'doc': [
                    'https://docs.gemini.com/rest-api',
                    'https://docs.sandbox.gemini.com',
                ],
                'test': {
                    'public': 'https://api.sandbox.gemini.com',
                    'private': 'https://api.sandbox.gemini.com',
                    'web': 'https://docs.sandbox.gemini.com',
                },
                'fees': [
                    'https://gemini.com/api-fee-schedule',
                    'https://gemini.com/trading-fees',
                    'https://gemini.com/transfer-fees',
                ],
            },
            'api': {
                'web': {
                    'get': [
                        'rest-api',
                    ],
                },
                'public': {
                    'get': [
                        'v1/symbols',
                        'v1/pricefeed',
                        'v1/pubticker/{symbol}',
                        'v1/book/{symbol}',
                        'v1/trades/{symbol}',
                        'v1/auction/{symbol}',
                        'v1/auction/{symbol}/history',
                        'v2/candles/{symbol}/{timeframe}',
                        'v2/ticker/{symbol}',
                    ],
                },
                'private': {
                    'post': [
                        'v1/order/new',
                        'v1/order/cancel',
                        'v1/order/cancel/session',
                        'v1/order/cancel/all',
                        'v1/order/status',
                        'v1/orders',
                        'v1/mytrades',
                        'v1/notionalvolume',
                        'v1/tradevolume',
                        'v1/transfers',
                        'v1/balances',
                        'v1/deposit/{currency}/newAddress',
                        'v1/withdraw/{currency}',
                        'v1/heartbeat',
                        'v1/transfers',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'taker': 0.0035,
                    'maker': 0.001,
                },
            },
            'httpExceptions': {
                '400': BadRequest, // Auction not open or paused, ineligible timing, market not open, or the request was malformed, in the case of a private API request, missing or malformed Gemini private API authentication headers
                '403': PermissionDenied, // The API key is missing the role necessary to access this private API endpoint
                '404': OrderNotFound, // Unknown API entry point or Order not found
                '406': InsufficientFunds, // Insufficient Funds
                '429': RateLimitExceeded, // Rate Limiting was applied
                '500': ExchangeError, // The server encountered an error
                '502': ExchangeError, // Technical issues are preventing the request from being satisfied
                '503': OnMaintenance, // The exchange is down for maintenance
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1hr',
                '6h': '6hr',
                '1d': '1day',
            },
            'exceptions': {
                'exact': {
                    'AuctionNotOpen': BadRequest, // Failed to place an auction-only order because there is no current auction open for this symbol
                    'ClientOrderIdTooLong': BadRequest, // The Client Order ID must be under 100 characters
                    'ClientOrderIdMustBeString': BadRequest, // The Client Order ID must be a string
                    'ConflictingOptions': BadRequest, // New orders using a combination of order execution options are not supported
                    'EndpointMismatch': BadRequest, // The request was submitted to an endpoint different than the one in the payload
                    'EndpointNotFound': BadRequest, // No endpoint was specified
                    'IneligibleTiming': BadRequest, // Failed to place an auction order for the current auction on this symbol because the timing is not eligible, new orders may only be placed before the auction begins.
                    'InsufficientFunds': InsufficientFunds, // The order was rejected because of insufficient funds
                    'InvalidJson': BadRequest, // The JSON provided is invalid
                    'InvalidNonce': InvalidNonce, // The nonce was not greater than the previously used nonce, or was not present
                    'InvalidOrderType': InvalidOrder, // An unknown order type was provided
                    'InvalidPrice': InvalidOrder, // For new orders, the price was invalid
                    'InvalidQuantity': InvalidOrder, // A negative or otherwise invalid quantity was specified
                    'InvalidSide': InvalidOrder, // For new orders, and invalid side was specified
                    'InvalidSignature': AuthenticationError, // The signature did not match the expected signature
                    'InvalidSymbol': BadRequest, // An invalid symbol was specified
                    'InvalidTimestampInPayload': BadRequest, // The JSON payload contained a timestamp parameter with an unsupported value.
                    'Maintenance': OnMaintenance, // The system is down for maintenance
                    'MarketNotOpen': InvalidOrder, // The order was rejected because the market is not accepting new orders
                    'MissingApikeyHeader': AuthenticationError, // The X-GEMINI-APIKEY header was missing
                    'MissingOrderField': InvalidOrder, // A required order_id field was not specified
                    'MissingRole': AuthenticationError, // The API key used to access this endpoint does not have the required role assigned to it
                    'MissingPayloadHeader': AuthenticationError, // The X-GEMINI-PAYLOAD header was missing
                    'MissingSignatureHeader': AuthenticationError, // The X-GEMINI-SIGNATURE header was missing
                    'NoSSL': AuthenticationError, // You must use HTTPS to access the API
                    'OptionsMustBeArray': BadRequest, // The options parameter must be an array.
                    'OrderNotFound': OrderNotFound, // The order specified was not found
                    'RateLimit': RateLimitExceeded, // Requests were made too frequently. See Rate Limits below.
                    'System': ExchangeError, // We are experiencing technical issues
                    'UnsupportedOption': BadRequest, // This order execution option is not supported.
                },
                'broad': {
                    'The Gemini Exchange is currently undergoing maintenance.': OnMaintenance, // The Gemini Exchange is currently undergoing maintenance. Please check https://status.gemini.com/ for more information.
                },
            },
            'options': {
                'fetchMarketsMethod': 'fetch_markets_from_web',
                'fetchTickerMethod': 'fetchTickerV1', // Method for fetching ticker. Available values are: fetchTickerV1, fetchTickerV2, fetchTickerV1AndV2. Where fetchTickerV1AndV2 is doing both v1 and v2 calls
            },
        });
    }

    async fetchMarkets (params = {}) {
        const method = this.safeValue (this.options, 'fetchMarketsMethod', 'fetch_markets_from_api');
        return await this[method] (params);
    }

    async fetchMarketsFromWeb (symbols = undefined, params = {}) {
        const response = await this.webGetRestApi (params);
        const sections = response.split ('<h1 id="symbols-and-minimums">Symbols and minimums</h1>');
        const numSections = sections.length;
        const error = this.id + ' the ' + this.name + ' API doc HTML markup has changed, breaking the parser of order limits and precision info for ' + this.name + ' markets.';
        if (numSections !== 2) {
            throw new NotSupported (error);
        }
        const tables = sections[1].split ('tbody>');
        const numTables = tables.length;
        if (numTables < 2) {
            throw new NotSupported (error);
        }
        const rows = tables[1].split ("\n<tr>\n"); // eslint-disable-line quotes
        const numRows = rows.length;
        if (numRows < 2) {
            throw new NotSupported (error);
        }
        const apiSymbols = await this.fetchMarketsFromAPI (params);
        const indexedSymbols = this.indexBy (apiSymbols, 'symbol');
        const result = [];
        // skip the first element (empty string)
        for (let i = 1; i < numRows; i++) {
            const row = rows[i];
            const cells = row.split ("</td>\n"); // eslint-disable-line quotes
            const numCells = cells.length;
            if (numCells < 9) {
                throw new NotSupported (error);
            }
            //     [
            //         '<td>BTC', // currency
            //         '<td>0.00001 BTC (1e-5)', // min order size
            //         '<td>0.00000001 BTC (1e-8)', // tick size
            //         '<td>0.01 USD', // usd price increment
            //         '<td>N/A', // btc price increment
            //         '<td>0.0001 ETH (1e-4)', // eth price increment
            //         '<td>0.0001 BCH (1e-4)', // bch price increment
            //         '<td>0.001 LTC (1e-3)', // ltc price increment
            //         '</tr>'
            //     ]
            //
            const uppercaseBaseId = cells[0].replace ('<td>', '');
            const baseId = uppercaseBaseId.toLowerCase ();
            const base = this.safeCurrencyCode (baseId);
            const quoteIds = [ 'usd', 'btc', 'eth', 'bch', 'ltc' ];
            const minAmountString = cells[1].replace ('<td>', '');
            const minAmountParts = minAmountString.split (' ');
            const minAmount = this.safeFloat (minAmountParts, 0);
            const amountPrecisionString = cells[2].replace ('<td>', '');
            const amountPrecisionParts = amountPrecisionString.split (' ');
            const amountPrecision = this.precisionFromString (amountPrecisionParts[0]);
            for (let j = 0; j < quoteIds.length; j++) {
                const quoteId = quoteIds[j];
                const quote = this.safeCurrencyCode (quoteId);
                const pricePrecisionIndex = this.sum (3, j);
                const pricePrecisionString = cells[pricePrecisionIndex].replace ('<td>', '');
                if (pricePrecisionString === 'N/A') {
                    continue;
                }
                const pricePrecisionParts = pricePrecisionString.split (' ');
                const pricePrecision = this.precisionFromString (pricePrecisionParts[0]);
                const symbol = base + '/' + quote;
                if (!(symbol in indexedSymbols)) {
                    continue;
                }
                const id = baseId + quoteId;
                const active = undefined;
                result.push ({
                    'id': id,
                    'info': row,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'active': active,
                    'precision': {
                        'amount': amountPrecision,
                        'price': pricePrecision,
                    },
                    'limits': {
                        'amount': {
                            'min': minAmount,
                            'max': undefined,
                        },
                        'price': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                });
            }
        }
        return result;
    }

    async fetchMarketsFromAPI (params = {}) {
        const response = await this.publicGetV1Symbols (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const id = response[i];
            const market = id;
            const idLength = id.length - 0;
            let baseId = undefined;
            let quoteId = undefined;
            if (idLength === 7) {
                baseId = id.slice (0, 4);
                quoteId = id.slice (4, 7);
            } else {
                baseId = id.slice (0, 3);
                quoteId = id.slice (3, 6);
            }
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const precision = {
                'amount': undefined,
                'price': undefined,
            };
            result.push ({
                'id': id,
                'info': market,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'precision': precision,
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
                'active': undefined,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['limit_bids'] = limit;
            request['limit_asks'] = limit;
        }
        const response = await this.publicGetV1BookSymbol (this.extend (request, params));
        return this.parseOrderBook (response, undefined, 'bids', 'asks', 'price', 'amount');
    }

    async fetchTickerV1 (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1PubtickerSymbol (this.extend (request, params));
        //
        //     {
        //         "bid":"9117.95",
        //         "ask":"9117.96",
        //         "volume":{
        //             "BTC":"1615.46861748",
        //             "USD":"14727307.57545006088",
        //             "timestamp":1594982700000
        //         },
        //         "last":"9115.23"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTickerV2 (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV2TickerSymbol (this.extend (request, params));
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "open":"9080.58",
        //         "high":"9184.53",
        //         "low":"9063.56",
        //         "close":"9116.08",
        //         // Hourly prices descending for past 24 hours
        //         "changes":["9117.33","9105.69","9106.23","9120.35","9098.57","9114.53","9113.55","9128.01","9113.63","9133.49","9133.49","9137.75","9126.73","9103.91","9119.33","9123.04","9124.44","9117.57","9114.22","9102.33","9076.67","9074.72","9074.97","9092.05"],
        //         "bid":"9115.86",
        //         "ask":"9115.87"
        //     }
        //
        return this.parseTicker (response, market);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const tickerType = this.safeValue (this.options, 'fetchTickerMethod');
        if ((tickerType !== 'fetchTickerV1') && (tickerType !== 'fetchTickerV2') && (tickerType !== 'fetchTickerV1AndV2')) {
            throw new ExchangeError (this.id + " does not support '" + tickerType + "' ticker type method. Set exchange.options['fetchTickerMethod'] to 'fetchTickerV1', 'fetchTickerV2' or 'fetchTickerV1AndV2'"); // eslint-disable-line quotes
        }
        let ticker = {};
        let tickerB = {};
        if ((tickerType === 'fetchTickerV1') || (tickerType === 'fetchTickerV1AndV2')) {
            ticker = await this.publicGetV1PubtickerSymbol (this.extend (request, params));
        }
        if ((tickerType === 'fetchTickerV2') || (tickerType === 'fetchTickerV1AndV2')) {
            tickerB = await this.publicGetV2TickerSymbol (this.extend (request, params));
        }
        const timestamp = this.safeInteger (ticker['volume'], 'timestamp');
        const baseCurrency = market['base']; // unified structures are guaranteed to have unified fields
        const quoteCurrency = market['quote']; // so we don't need safe-methods for unified structures
        const last = this.safeFloat (ticker, 'last');
        const open = this.safeFloat (tickerB, 'open');
        const close = this.safeFloat (tickerB, 'close');
        const high = this.safeFloat (tickerB, 'high');
        const low = this.safeFloat (tickerB, 'low');
        let change = undefined;
        let percentage = undefined;
        if (last !== undefined) {
            if ((open !== undefined) && (open > 0)) {
                change = last - open;
                percentage = ((100 / open) * last) - 100;
            }
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': close,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': this.safeFloat (ticker['volume'], baseCurrency),
            'quoteVolume': this.safeFloat (ticker['volume'], quoteCurrency),
            'info': ticker,
        };
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTickers
        //
        //     {
        //         "pair": "BATUSD",
        //         "price": "0.20687",
        //         "percentChange24h": "0.0146"
        //     }
        //
        // fetchTickerV1
        //
        //     {
        //         "bid":"9117.95",
        //         "ask":"9117.96",
        //         "volume":{
        //             "BTC":"1615.46861748",
        //             "USD":"14727307.57545006088",
        //             "timestamp":1594982700000
        //         },
        //         "last":"9115.23"
        //     }
        //
        // fetchTickerV2
        //
        //     {
        //         "symbol":"BTCUSD",
        //         "open":"9080.58",
        //         "high":"9184.53",
        //         "low":"9063.56",
        //         "close":"9116.08",
        //         // Hourly prices descending for past 24 hours
        //         "changes":["9117.33","9105.69","9106.23","9120.35","9098.57","9114.53","9113.55","9128.01","9113.63","9133.49","9133.49","9137.75","9126.73","9103.91","9119.33","9123.04","9124.44","9117.57","9114.22","9102.33","9076.67","9074.72","9074.97","9092.05"],
        //         "bid":"9115.86",
        //         "ask":"9115.87"
        //     }
        //
        const volume = this.safeValue (ticker, 'volume', {});
        const timestamp = this.safeInteger (volume, 'timestamp');
        let symbol = undefined;
        const marketId = this.safeString (ticker, 'pair');
        let baseId = undefined;
        let quoteId = undefined;
        let base = undefined;
        let quote = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const idLength = marketId.length - 0;
                if (idLength === 7) {
                    baseId = marketId.slice (0, 4);
                    quoteId = marketId.slice (4, 7);
                } else {
                    baseId = marketId.slice (0, 3);
                    quoteId = marketId.slice (3, 6);
                }
                base = this.safeCurrencyCode (baseId);
                quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
            baseId = market['baseId'].toUpperCase ();
            quoteId = market['quoteId'].toUpperCase ();
            base = market['base'];
            quote = market['quote'];
        }
        const price = this.safeFloat (ticker, 'price');
        const last = this.safeFloat2 (ticker, 'last', 'close', price);
        let percentage = this.safeFloat (ticker, 'percentChange24h');
        let change = undefined;
        let open = this.safeFloat (ticker, 'open');
        let average = undefined;
        if (last !== undefined) {
            if (open !== undefined) {
                change = last - open;
                if (open !== 0) {
                    percentage = change / open * 100;
                }
                average = this.sum (last, open) / 2;
            } else if (percentage !== undefined) {
                change = last * percentage;
                if (open === undefined) {
                    open = last - change;
                }
                average = this.sum (last, open) / 2;
            }
        }
        const baseVolume = this.safeFloat (volume, baseId);
        const quoteVolume = this.safeFloat (volume, quoteId);
        let vwap = undefined;
        if ((quoteVolume !== undefined) && (baseVolume !== undefined) && (baseVolume !== 0)) {
            vwap = quoteVolume / baseVolume;
        }
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': undefined,
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined, // previous day close
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
    }

    parseTickers (tickers, symbols = undefined) {
        const result = [];
        for (let i = 0; i < tickers.length; i++) {
            result.push (this.parseTicker (tickers[i]));
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetV1Pricefeed (params);
        //
        //     [
        //         {
        //             "pair": "BATUSD",
        //             "price": "0.20687",
        //             "percentChange24h": "0.0146"
        //         },
        //         {
        //             "pair": "LINKETH",
        //             "price": "0.018",
        //             "percentChange24h": "0.0000"
        //         },
        //     ]
        //
        return this.parseTickers (response, symbols);
    }

    parseTrade (trade, market = undefined) {
        const timestamp = this.safeInteger (trade, 'timestampms');
        const id = this.safeString (trade, 'tid');
        const orderId = this.safeString (trade, 'order_id');
        const feeCurrencyId = this.safeString (trade, 'fee_currency');
        const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
        const fee = {
            'cost': this.safeFloat (trade, 'fee_amount'),
            'currency': feeCurrencyCode,
        };
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'amount');
        let cost = undefined;
        if (price !== undefined) {
            if (amount !== undefined) {
                cost = price * amount;
            }
        }
        const type = undefined;
        const side = this.safeStringLower (trade, 'type');
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        return {
            'id': id,
            'order': orderId,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetV1TradesSymbol (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostV1Balances (params);
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['total'] = this.safeFloat (balance, 'amount');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        const timestamp = this.safeInteger (order, 'timestampms');
        const amount = this.safeFloat (order, 'original_amount');
        const remaining = this.safeFloat (order, 'remaining_amount');
        const filled = this.safeFloat (order, 'executed_amount');
        let status = 'closed';
        if (order['is_live']) {
            status = 'open';
        }
        if (order['is_cancelled']) {
            status = 'canceled';
        }
        const price = this.safeFloat (order, 'price');
        const average = this.safeFloat (order, 'avg_execution_price');
        let cost = undefined;
        if (filled !== undefined) {
            if (average !== undefined) {
                cost = filled * average;
            }
        }
        let type = this.safeString (order, 'type');
        if (type === 'exchange limit') {
            type = 'limit';
        } else if (type === 'market buy' || type === 'market sell') {
            type = 'market';
        } else {
            type = order['type'];
        }
        const fee = undefined;
        let symbol = undefined;
        if (market === undefined) {
            const marketId = this.safeString (order, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        const id = this.safeString (order, 'order_id');
        const side = this.safeStringLower (order, 'side');
        const clientOrderId = this.safeString (order, 'client_order_id');
        return {
            'id': id,
            'clientOrderId': clientOrderId,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'average': average,
            'cost': cost,
            'amount': amount,
            'filled': filled,
            'remaining': remaining,
            'fee': fee,
            'trades': undefined,
        };
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const response = await this.privatePostV1OrderStatus (this.extend (request, params));
        return this.parseOrder (response);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostV1Orders (params);
        let orders = this.parseOrders (response, undefined, since, limit);
        if (symbol !== undefined) {
            const market = this.market (symbol); // throws on non-existent symbol
            orders = this.filterBySymbol (orders, market['symbol']);
        }
        return orders;
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        if (type === 'market') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        const nonce = this.nonce ();
        const request = {
            'client_order_id': nonce.toString (),
            'symbol': this.marketId (symbol),
            'amount': amount.toString (),
            'price': price.toString (),
            'side': side,
            'type': 'exchange limit', // gemini allows limit orders only
        };
        const response = await this.privatePostV1OrderNew (this.extend (request, params));
        return {
            'info': response,
            'id': response['order_id'],
        };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        return await this.privatePostV1OrderCancel (this.extend (request, params));
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        if (limit !== undefined) {
            request['limit_trades'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = parseInt (since / 1000);
        }
        const response = await this.privatePostV1Mytrades (this.extend (request, params));
        return this.parseTrades (response, market, since, limit);
    }

    async withdraw (code, amount, address, tag = undefined, params = {}) {
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'amount': amount,
            'address': address,
        };
        const response = await this.privatePostV1WithdrawCurrency (this.extend (request, params));
        return {
            'info': response,
            'id': this.safeString (response, 'txHash'),
        };
    }

    nonce () {
        return this.milliseconds ();
    }

    async fetchTransactions (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {};
        if (limit !== undefined) {
            request['limit_transfers'] = limit;
        }
        if (since !== undefined) {
            request['timestamp'] = since;
        }
        const response = await this.privatePostV1Transfers (this.extend (request, params));
        return this.parseTransactions (response);
    }

    parseTransaction (transaction, currency = undefined) {
        const timestamp = this.safeInteger (transaction, 'timestampms');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        const address = this.safeString (transaction, 'destination');
        const type = this.safeStringLower (transaction, 'type');
        let status = 'pending';
        // When deposits show as Advanced or Complete they are available for trading.
        if (transaction['status']) {
            status = 'ok';
        }
        let fee = undefined;
        const feeAmount = this.safeFloat (transaction, 'feeAmount');
        if (feeAmount !== undefined) {
            fee = {
                'cost': feeAmount,
                'currency': code,
            };
        }
        return {
            'info': transaction,
            'id': this.safeString (transaction, 'eid'),
            'txid': this.safeString (transaction, 'txHash'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': address,
            'tag': undefined, // or is it defined?
            'type': type, // direction of the transaction, ('deposit' | 'withdraw')
            'amount': this.safeFloat (transaction, 'amount'),
            'currency': code,
            'status': status,
            'updated': undefined,
            'fee': fee,
        };
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            const request = this.extend ({
                'request': url,
                'nonce': nonce,
            }, query);
            let payload = this.json (request);
            payload = this.stringToBase64 (this.encode (payload));
            const signature = this.hmac (payload, this.encode (this.secret), 'sha384');
            headers = {
                'Content-Type': 'text/plain',
                'X-GEMINI-APIKEY': this.apiKey,
                'X-GEMINI-PAYLOAD': this.decode (payload),
                'X-GEMINI-SIGNATURE': signature,
            };
        } else {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        }
        url = this.urls['api'][api] + url;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (httpCode, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            if (typeof body === 'string') {
                const feedback = this.id + ' ' + body;
                this.throwBroadlyMatchedException (this.exceptions['broad'], body, feedback);
            }
            return; // fallback to default error handler
        }
        //
        //     {
        //         "result": "error",
        //         "reason": "BadNonce",
        //         "message": "Out-of-sequence nonce <1234> precedes previously used nonce <2345>"
        //     }
        //
        const result = this.safeString (response, 'result');
        if (result === 'error') {
            const reason = this.safeString (response, 'reason');
            const message = this.safeString (response, 'message');
            const feedback = this.id + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions['exact'], reason, feedback);
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }

    async createDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privatePostV1DepositCurrencyNewAddress (this.extend (request, params));
        const address = this.safeString (response, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'info': response,
        };
    }

    async fetchOHLCV (symbol, timeframe = '5m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'timeframe': this.timeframes[timeframe],
            'symbol': market['id'],
        };
        const response = await this.publicGetV2CandlesSymbolTimeframe (this.extend (request, params));
        //
        //     [
        //         [1591515000000,0.02509,0.02509,0.02509,0.02509,0],
        //         [1591514700000,0.02503,0.02509,0.02503,0.02509,44.6405],
        //         [1591514400000,0.02503,0.02503,0.02503,0.02503,0],
        //     ]
        //
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }
};
