import { all, call } from "redux-saga/effects";
import { userSagas } from "./user/sagas";
import { eventsSagas } from "./events/sagas";
import { eventParticipantsSagas } from "./eventParticipants/sagas";

export function* rootSaga() {
  yield all([call(userSagas), call(eventsSagas), call(eventParticipantsSagas)]);
}
