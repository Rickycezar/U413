exports.roles = 'user';

exports.description = "Allows you to create a new topic on the specified board.";

exports.usage = "[title] [body] [options]";

exports.options = {
    title: {
        required: true,
        noName: true,
        prompt: "Please enter a title for your topic.",
        hidden: true,
        validate: /^.{1,200}$/i
    },
    body: {
        required: true,
        noName: true,
        prompt: "Please type the body of your topic. (you can use Github-flavored Markdown syntax)",
        multiLinePrompt: true,
        hidden: true,
        validate: /^.{1,10000}/i
    },
    tags: {
        required: true,
        noName: true,
        prompt: "Please enter a comma-delimited list of up to five tags.",
        hidden: true,
        validate: function (tags) {
            var regex = /^[\w-]{2,30}(, ?[\w-]{2,30}){0,4}$/i;
            return regex.test(tags) ? true : "Tags must be a comma-delimited list with no more than five items. (Regex: {0})".format(regex);
        }
    },
    dontShow: {
        aliases: ['d'],
        description: "Don't display the topic after creating it."
    }
};

exports.invoke = function(shell, options) {
    shell.getCurrentUser(function (user) {
        var tags = options.tags.toString().toLowerCase().replace(/, /g, ',').split(',').unique();

        var newTopic = new shell.db.Topic({
            creator: user,
            title: options.title,
            body: options.body,
            tags: tags
        });
        newTopic.save(function (err) {
            if (err) return shell.error(err);
            if (shell.settings.debug) {
                console.log('New topic {{0}} created by {1}.'.format(newTopic.id, user.username));;
            }
            shell.log("Topic {{0}} created successfully.".format(newTopic.id));
            if (!options.dontShow)
                shell.execute("topic", null, { id: newTopic.id });
        });
    });
};