import aboutSprintQa from "../../../data/chatbot/about_sprint_QA_dataset.json";
import admissionQa from "../../../data/chatbot/admission_QA_dataset.json";
import careerQa from "../../../data/chatbot/career_QA_dataset.json";
import coursesQa from "../../../data/chatbot/courses_QA_dataset.json";
import paymentQa from "../../../data/chatbot/payment_QA_dataset.json";
import partnershipsEventsQa from "../../../data/chatbot/partnerships_events_QA_dataset.json";
import privacySecurityQa from "../../../data/chatbot/privacy_security_QA_dataset.json";
import qualityAssuranceQa from "../../../data/chatbot/quality_assurance_QA_dataset.json";
import registrationQa from "../../../data/chatbot/registration_QA_dataset.json";
import scholarshipQa from "../../../data/chatbot/scholarship_QA_dataset.json";
import sprintDashboardQa from "../../../data/chatbot/sprint_dashboard_QA_dataset.json";
import supportQa from "../../../data/chatbot/support_QA_dataset.json";

const topicDatasets = [
  aboutSprintQa,
  admissionQa,
  careerQa,
  coursesQa,
  paymentQa,
  partnershipsEventsQa,
  privacySecurityQa,
  qualityAssuranceQa,
  registrationQa,
  scholarshipQa,
  sprintDashboardQa,
  supportQa,
];

export const qaDataset = topicDatasets
  .flat()
  .sort((left, right) => {
    const leftOrder = left._master_order;
    const rightOrder = right._master_order;
    const hasLeftOrder = Number.isInteger(leftOrder);
    const hasRightOrder = Number.isInteger(rightOrder);

    if (hasLeftOrder && hasRightOrder) return leftOrder - rightOrder;
    if (hasLeftOrder) return -1;
    if (hasRightOrder) return 1;
    return 0;
  })
  .map(({ _master_order, ...record }) => record);
