import * as pulumi from "@pulumi/pulumi";
import * as newrelic from "@pulumi/newrelic";

const policy = new newrelic.AlertPolicy("alert-policy");

// Look up the APM service you just created.
const app = newrelic.getEntity({
    name: "my-api",
});

// Define an alert condition to trigger an alert when the
// service's error rate exceeds 1% over a five-minute period.
const condition = new newrelic.AlertCondition("alert-condition", {
    type: "apm_app_metric",
    metric: "error_percentage",
    conditionScope: "application",
    policyId: policy.id.apply(id => parseInt(id)),
    entities: [
        pulumi.output(app).applicationId,
    ],
    terms: [
        {
            operator: "above",
            threshold: 1,
            duration: 5,
            priority: "critical",
            timeFunction: "all",
        },
    ],
});

// Define an alert channel to notify you by email.
const channel = new newrelic.AlertChannel("alert-channel", {
    type: "email",
    config: {
        recipients: "your-email@example.com",
        includeJsonAttachment: pulumi.output("true"),
    },
});

// Define a Slack alert channel.
// const slackChannel = new newrelic.AlertChannel("slack-channel", {
//     type: "slack",
//     config: {
//         channel: "your-designated-slack-channel",
//         url: "https://hooks.slack.com/services/XXXXXXX/XXXXXXX/XXXXXXX",
//     },
// });

// Associate the alert channel with the policy defined above.
const policyChannel = new newrelic.AlertPolicyChannel("alert-policy-channel", {
    policyId: policy.id.apply(id => parseInt(id)),
    channelIds: [
        channel.id.apply(id => parseInt(id)),
        // slackChannel.id.apply(id => parseInt(id)),
    ],
});
