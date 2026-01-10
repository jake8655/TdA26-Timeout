package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;

import io.ebean.Model;
import io.ebean.annotation.DbJson;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "questions")
public class Question extends Model {

    public enum Type {
        singleChoice,
        multipleChoice
    }

    @Id private UUID uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "quiz_uuid", nullable = false)
    @JsonBackReference
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false, columnDefinition = "text")
    private String question;

    @DbJson
    @Column(nullable = false, columnDefinition = "json")
    private List<String> options;

    private Integer correctIndex;

    @DbJson
    @Column(columnDefinition = "json")
    private List<Integer> correctIndices;

    @WhenCreated private Instant createdAt;

    @WhenModified private Instant updatedAt;

    public Question() {}
}
