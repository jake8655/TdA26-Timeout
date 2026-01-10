package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;

import io.ebean.Model;
import io.ebean.annotation.DbJson;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "quiz_results")
public class QuizResult extends Model {

    @Id private UUID uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "quiz_uuid", nullable = false)
    @JsonBackReference
    private Quiz quiz;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false)
    private Double maxScore;

    @DbJson
    @Column(nullable = false, columnDefinition = "json")
    private List<Boolean> correctPerQuestion;

    @Column(nullable = false)
    private Instant submittedAt;

    public QuizResult() {}

    public QuizResult(
            Quiz quiz,
            Double score,
            Double maxScore,
            List<Boolean> correctPerQuestion,
            Instant submittedAt) {
        this.quiz = quiz;
        this.score = score;
        this.maxScore = maxScore;
        this.correctPerQuestion = correctPerQuestion;
        this.submittedAt = submittedAt;
    }
}
