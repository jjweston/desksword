/*

desksword : Log chat activity on Twitch channels.

Copyright (C) 2017, Jeffrey J. Weston <jjweston@gmail.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var fs  = require( "fs"     );
var tmi = require( "tmi.js" );

var Config = require( "./Config.js" );

var logDir = "logs";
var numberFormat2 = new Intl.NumberFormat( "en-US", { useGrouping: false, minimumIntegerDigits: 2 } );

fs.mkdir( logDir, logsDirectoryCreated );

function logsDirectoryCreated( error )
{
    if ( error )
    {
        if ( error.code !== "EEXIST" )
        {
            throw error;
        }
    }

    console.log( "Created logs directory." );
    fs.appendFile( "logs/test.log", "This is a test.\n", appendCallback )

    var options =
    {
       options: { debug: true },
       identity: { username: Config.twitchUser, password: Config.twitchAuth },
       channels: Config.twitchChannels
    };

    var twitchClient = new tmi.client( options );
    twitchClient.on( "action",        onAction        );
    twitchClient.on( "ban",           onBan           );
    twitchClient.on( "chat",          onChat          );
    twitchClient.on( "cheer",         onCheer         );
    twitchClient.on( "clearchat",     onClearchat     );
    twitchClient.on( "connected",     onConnected     );
    twitchClient.on( "connecting",    onConnecting    );
    twitchClient.on( "disconnected",  onDisconnected  );
    twitchClient.on( "emoteonly",     onEmoteonly     );
    twitchClient.on( "emotesets",     onEmotesets     );
    twitchClient.on( "followersonly", onFollowersonly );
    twitchClient.on( "hosted",        onHosted        );
    twitchClient.on( "hosting",       onHosting       );
    twitchClient.on( "join",          onJoin          );
    twitchClient.on( "logon",         onLogon         );
    twitchClient.on( "mod",           onMod           );
    twitchClient.on( "mods",          onMods          );
    twitchClient.on( "notice",        onNotice        );
    twitchClient.on( "part",          onPart          );
    twitchClient.on( "ping",          onPing          );
    twitchClient.on( "pong",          onPong          );
    twitchClient.on( "r9kbeta",       onR9kbeta       );
    twitchClient.on( "reconnect",     onReconnect     );
    twitchClient.on( "resub",         onResub         );
    twitchClient.on( "roomstate",     onRoomstate     );
    twitchClient.on( "serverchange",  onServerchange  );
    twitchClient.on( "slowmode",      onSlowmode      );
    twitchClient.on( "subscribers",   onSubscribers   );
    twitchClient.on( "subscription",  onSubscription  );
    twitchClient.on( "timeout",       onTimeout       );
    twitchClient.on( "unhost",        onUnhost        );
    twitchClient.on( "unmod",         onUnmod         );
    twitchClient.on( "whisper",       onWhisper       );
    twitchClient.connect();
}

function onAction( channel, userstate, message, self )
{
    event =
    {
        time      : new Date().toISOString(),
        type      : "twitch-action",
        channel   : channel,
        userstate : userstate,
        message   : message,
        self      : self
    };

    var displayName = getTwitchDisplayName( userstate );
    logEvent( event, "[" + channel + "] <" + displayName + ">: " + message );
}

function onBan( channel, username, reason )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-ban",
        channel  : channel,
        username : username,
        reason   : reason
    };

    logEvent( event, "[" + channel + "] <" + username + ">: " + reason );
}

function onChat( channel, userstate, message, self )
{
    event =
    {
        time      : new Date().toISOString(),
        type      : "twitch-chat",
        channel   : channel,
        userstate : userstate,
        message   : message,
        self      : self
    };

    var displayName = getTwitchDisplayName( userstate );
    logEvent( event, "[" + channel + "] <" + displayName + ">: " + message );
}

function onCheer( channel, userstate, message )
{
    event =
    {
        time      : new Date().toISOString(),
        type      : "twitch-cheer",
        channel   : channel,
        userstate : userstate,
        message   : message
    };

    var displayName = getTwitchDisplayName( userstate );
    logEvent( event, "[" + channel + "] <" + displayName + "> (" + userstate.bits + "): " + message );
}

function onClearchat( channel )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-clearchat",
        channel : channel
    };

    logEvent( event, "[" + channel + "]" );
}

function onConnected( address, port )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-connected",
        address : address,
        port    : port
    };

    logEvent( event, address + ":" + port );
}

function onConnecting( address, port )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-connecting",
        address : address,
        port    : port
    };

    logEvent( event, address + ":" + port );
}

function onDisconnected( reason )
{
    event =
    {
        time   : new Date().toISOString(),
        type   : "twitch-disconnected",
        reason : reason
    };

    logEvent( event, reason );
}

function onEmoteonly( channel, enabled )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-emoteonly",
        channel : channel,
        enabled : enabled
    };

    logEvent( event, "[" + channel + "]: " + enabled );
}

function onEmotesets( sets, obj )
{
    event =
    {
        time : new Date().toISOString(),
        type : "twitch-emotesets",
        sets : sets,
        obj  : obj
    };

    logEvent( event, "" );
}

function onFollowersonly( channel, enabled, length )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-followersonly",
        channel : channel,
        enabled : enabled,
        length  : length
    };

    logEvent( event, "[" + channel + "]: " + enabled + " - " + length );
}

function onHosted( channel, username, viewers )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-hosted",
        channel  : channel,
        username : username,
        viewers  : viewers
    };

    logEvent( event, "[" + channel + "] <" + username + ">: " + viewers );
}

function onHosting( channel, target, viewers )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-hosting",
        channel : channel,
        target  : target,
        viewers : viewers
    };

    logEvent( event, "[" + channel + "] <" + target + ">: " + viewers );
}

function onJoin( channel, username, self )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-join",
        channel  : channel,
        username : username,
        self     : self
    };

    logEvent( event, "[" + channel + "] <" + username + ">" );
}

function onLogon()
{
    event =
    {
        time : new Date().toISOString(),
        type : "twitch-logon"
    };

    logEvent( event, "" );
}

function onMod( channel, username )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-mod",
        channel  : channel,
        username : username
    };

    logEvent( event, "[" + channel + "] <" + username + ">" );
}

function onMods( channel, mods )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-mods",
        channel : channel,
        mods    : mods
    };

    logEvent( event, "[" + channel + "]" );
}

function onNotice( channel, msgid, message )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-notice",
        channel : channel,
        msgid   : msgid,
        message : message
    };

    logEvent( event, "[" + channel + "]: " + msgid + " - " + message );
}

function onPart( channel, username, self )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-part",
        channel  : channel,
        username : username,
        self     : self
    };

    logEvent( event, "[" + channel + "] <" + username + ">" );
}

function onPing()
{
    event =
    {
        time : new Date().toISOString(),
        type : "twitch-ping"
    };

    logEvent( event, "" );
}

function onPong()
{
    event =
    {
        time : new Date().toISOString(),
        type : "twitch-pong"
    };

    logEvent( event, "" );
}

function onR9kbeta( channel, enabled )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-r9kbeta",
        channel : channel,
        enabled : enabled
    };

    logEvent( event, "[" + channel + "]: " + enabled );
}

function onReconnect()
{
    event =
    {
        time : new Date().toISOString(),
        type : "twitch-reconnect"
    };

    logEvent( event, "" );
}

function onResub( channel, username, months, message )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-resub",
        channel  : channel,
        username : username,
        months   : months,
        message  : message
    };

    logEvent( event, "[" + channel + "] <" + username + "> (" + months + "): " + message );
}

function onRoomstate( channel, state )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-roomstate",
        channel : channel,
        state   : state
    };

    logEvent( event, "[" + channel + "]" );
}

function onServerchange( channel )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-serverchange",
        channel : channel
    };

    logEvent( event, "[" + channel + "]" );
}

function onSlowmode( channel, enabled, length )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-slowmode",
        channel : channel,
        enabled : enabled,
        length  : length
    };

    logEvent( event, "[" + channel + "]: " + enabled + " - " + length );
}

function onSubscribers( channel, enabled )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-subscribers",
        channel : channel,
        enabled : enabled
    };

    logEvent( event, "[" + channel + "]: " + enabled );
}

function onSubscription( channel, username, method )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-subscription",
        channel  : channel,
        username : username,
        method   : method
    };

    logEvent( event, "[" + channel + "] <" + username + ">" );
}

function onTimeout( channel, username, reason, duration )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-timeout",
        channel  : channel,
        username : username,
        reason   : reason,
        duration : duration
    };

    logEvent( event, "[" + channel + "] <" + username + "> (" + duration + "): " + reason );
}

function onUnhost( channel, viewers )
{
    event =
    {
        time    : new Date().toISOString(),
        type    : "twitch-unhost",
        channel : channel,
        viewers : viewers
    };

    logEvent( event, "[" + channel + "]: " + viewers );
}

function onUnmod( channel, username )
{
    event =
    {
        time     : new Date().toISOString(),
        type     : "twitch-unmod",
        channel  : channel,
        username : username
    };

    logEvent( event, "[" + channel + "] <" + username + ">" );
}

function onWhisper( from, userstate, message, self )
{
    event =
    {
        time      : new Date().toISOString(),
        type      : "twitch-whisper",
        from      : from,
        userstate : userstate,
        message   : message,
        self      : self
    };

    var displayName = getTwitchDisplayName( userstate );
    logEvent( event, "<" + displayName + ">: " + message );
}

function logEvent( event, message )
{
    var filenamePrefix =
            logDir + "/" + currentDateStr() + ( event.channel !== undefined ? "-" + event.channel.substr( 1 ) : "" );
    var fullLog = filenamePrefix + "-full.txt";
    fs.appendFile( fullLog, JSON.stringify( event ) + "\n", appendCallback );

    if ( message !== null )
    {
        var eventType = event.type;
        if ( message.length > 0 ) eventType = padString( "                    ", eventType ); // pad the event type
        var logMessage = event.time + " - " + eventType + ( message.length > 0 ? " - " + message : "" );
        var simpleLog = filenamePrefix + "-simple.txt";
        fs.appendFile( simpleLog, logMessage + "\n", appendCallback );
    }
}

function currentDateStr()
{
    var date = new Date();
    return date.getUTCFullYear() + "-" +
           numberFormat2.format( date.getUTCMonth() + 1 ) + "-" +
           numberFormat2.format( date.getUTCDate()      );
}

function twitchEscape( string )
{
    // deal with Twitch escape sequences
    // https://github.com/ircv3/ircv3-specifications/blob/master/core/message-tags-3.2.md#escaping-values
    string = string.replace( /\\:/g,  ";"  ); // semicolon
    string = string.replace( /\\s/g,  " "  ); // space
    string = string.replace( /\\r/g,  "\r" ); // carriage return
    string = string.replace( /\\n/g,  "\n" ); // newline
    string = string.replace( /\\\\/g, "\\" ); // backslash
    return string;
}

function getTwitchDisplayName( userstate )
{
    var name = userstate[ "display-name" ];

    if (( name === null ) || ( name === undefined ))
    {
        name = userstate.username.substr( 0, 1 ).toUpperCase() + userstate.username.substr( 1 );
    }
    else
    {
        name = twitchEscape( name ).trim();
    }

    return name;
}

function padString( padding, string )
{
    if ( string.length >= padding.length )
    {
        return string;
    }

    return string + padding.substr( string.length );
}

function appendCallback( error )
{
    if ( error )
    {
        throw error;
    }
}
