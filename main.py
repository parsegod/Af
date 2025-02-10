"""A bot that says "bong" on the hour every hour"""

from datetime import datetime as dt

import discord
from discord.ext import commands, tasks

from cogs import utils


class BigBen(utils.Cog):

    def __init__(self, bot: utils.CustomBot):
        super().__init__(bot)
        self.last_posted_hour: int = None
        self.bing_bong.start()

    async def cog_command_error(self, ctx, error):
        """Error responses for cleaner commands"""
        if isinstance(error, commands.MissingPermissions):
            await ctx.send(f"You need the {error.missing_permissions[0]} permission to run this command.")
            return
        raise error

    def cog_unload(self):
        self.bing_bong.cancel()

    @tasks.loop(minutes=1)  # Check every minute
    async def bing_bong(self):
        """Do the bong"""
        now = dt.now()

        # Check if it's a new hour
        if now.hour != self.last_posted_hour and now.minute == 0:
            self.last_posted_hour = now.hour
            await self.send_bong_message()

    async def send_bong_message(self):
        """Send the bong message to all configured channels"""
        channels_to_delete = []
        for guild_id, channel in self.bot.bong_channels.items():
            try:
                await channel.send("Bong")
            except discord.Forbidden:
                pass  # Ignore forbidden errors
            except AttributeError:
                del self.bot.bong_channels[guild_id]
                channels_to_delete.append(guild_id)

        # Delete errored channels from the database
        async with self.bot.database() as db:
            for guild_id in channels_to_delete:
                await db("DELETE FROM bong_channels WHERE guild_id=$1", guild_id)

    @bing_bong.before_loop
    async def before_bing_bong(self):
        await self.bot.wait_until_ready()

    @commands.command()
    async def setbong(self, ctx: commands.Context, channel: discord.TextChannel = None):
        """Sets the channel for the bingbong"""
        # Filter out DMs
        channel = channel or ctx.channel
        if ctx.guild is None:
            await ctx.send("You can't run this command in DMs.")
            return

        # Check permissions
        if not channel.permissions_for(ctx.guild.me).send_messages:
            await ctx.send("I don't have permissions to send messages to that channel.")
            return

        # Save the channel
        self.bot.bong_channels[ctx.guild.id] = channel
        async with self.bot.database() as db:
            await db("INSERT INTO bong_channels VALUES ($1, $2)", ctx.guild.id, channel.id)

        # Respond
        await ctx.send("Channel set.")

def setup(bot: utils.CustomBot):
    x = BigBen(bot)
    bot.add_cog(x)