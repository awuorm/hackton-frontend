import { put, takeLatest, call, all, select } from "redux-saga/effects";
import {
  axiosWithAuth,
  selectToken,
  showSuccess,
  showError
} from "../../utils/api";
import {
  EventsTypes,
  fetchAllEvents,
  setEvents,
  setEventCategories
} from "./actions";

function* fetchAllEventsAsync() {
  try {
    const token = yield select(selectToken);
    const {
      data: { body }
    } = yield axiosWithAuth(token).get("/api/events");
    yield put(setEvents(body));
  } catch ({ response: { message } }) {
    yield showError(`⚠️ ${message}`);
  }
}

function* watchFetchAllEvents() {
  yield takeLatest(EventsTypes.FETCH_ALL_EVENTS, fetchAllEventsAsync);
}

function* createEventAsync({ payload, history }) {
  try {
    const token = yield select(selectToken);
    const { data } = yield axiosWithAuth(token).post("/api/events", payload);
    if (data) {
      yield put(fetchAllEvents());
      yield showSuccess(`😀 ${data.message}`);
    }
    yield history.push("/dashboard");
  } catch ({ response: { message, statusCode } }) {
    if (statusCode === 404) {
      history.push("/not-found");
    }
    yield showError(`⚠️ ${message}`);
  }
}

function* watchCreateEvent() {
  yield takeLatest(EventsTypes.CREATE_EVENT, createEventAsync);
}

function* deleteEventAsync({ payload }) {
  try {
    const token = yield select(selectToken);
    const { data } = yield axiosWithAuth(token).post("/api/events/" + payload);
    yield put(fetchAllEvents());
    yield showSuccess(`😲 ${data.message}`);
  } catch (error) {
    yield showError(`⚠️ ${error.message}`);
  }
}

function* watchDeleteEvent() {
  yield takeLatest(EventsTypes.DELETE_EVENT, deleteEventAsync);
}

function* updateEventAsync({ payload, history }) {
  try {
    const { id, ...eventInfo } = payload;
    const token = yield select(selectToken);
    const { data } = yield axiosWithAuth(token).put(
      "/api/events/" + id,
      eventInfo
    );
    if (data) {
      yield put(fetchAllEvents());
      yield showSuccess(`🎉 ${data.message}`);
      yield history.push("/dashboard");
    }
  } catch ({ response: { message, statusCode } }) {
    if (statusCode === 404) {
      history.push("/not-found");
    }
    yield showError(`⚠️ ${message}`);
  }
}

function* watchUpdateEvent() {
  yield takeLatest(EventsTypes.UPDATE_EVENT, updateEventAsync);
}

function* fetchEventCategoriesAsync() {
  try {
    const token = yield select(selectToken);
    const {
      data: { body }
    } = yield axiosWithAuth(token).get("/api/event-category");
    yield put(setEventCategories(body));
  } catch ({ response: { message } }) {
    yield showError(message);
  }
}

function* watchFetchEventCategories() {
  yield takeLatest(
    EventsTypes.FETCH_EVENT_CATEGORIES,
    fetchEventCategoriesAsync
  );
}

function* addTeamMemberAsync({ payload, history }) {
  try {
    const { eventId, email, role } = payload;
    const token = yield select(selectToken);
    const { data } = yield axiosWithAuth(token).post(
      `/api/events/${eventId}/team`,
      {
        email,
        role_type: role
      }
    );
    if (data) {
      yield showSuccess(`Added successfully`);
    }
    history.push(`/dashboard/event/${eventId}`);
  } catch ({ response: { message } }) {
    yield showError(`⚠️ ${message}`);
  }
}

function* watchAddTeamMember() {
  yield takeLatest(EventsTypes.ADD_TEAM_MEMBER, addTeamMemberAsync);
}

export function* eventsSagas() {
  yield all([
    call(watchFetchAllEvents),
    call(watchCreateEvent),
    call(watchDeleteEvent),
    call(watchUpdateEvent),
    call(watchFetchEventCategories),
    call(watchAddTeamMember)
  ]);
}
