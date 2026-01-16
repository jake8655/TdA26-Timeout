package eu.hypnomacka.timeout.server.utils;

import eu.hypnomacka.timeout.server.controllers.feed.CourseFeedService;
import eu.hypnomacka.timeout.server.core.Event;
import io.ebean.event.BeanPersistAdapter;
import io.ebean.event.BeanPersistRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPersistListener extends BeanPersistAdapter {

    private final CourseFeedService feedService;

    @Override
    public boolean isRegisterFor(Class<?> cls) {
        return Event.class.equals(cls);
    }

    @Override
    public void postInsert(BeanPersistRequest<?> request) {
        Event event = (Event) request.bean();
        log.debug("Event created, broadcasting: {}", event.getUuid());
        feedService.broadcastEvent(event);
    }

    @Override
    public void postUpdate(BeanPersistRequest<?> request) {
        Event event = (Event) request.bean();
        log.debug("Event updated, broadcasting: {}", event.getUuid());
        feedService.broadcastEvent(event);
    }
}