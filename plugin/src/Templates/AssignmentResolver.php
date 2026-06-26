<?php

declare( strict_types=1 );

namespace NivoraX\Templates;

defined( 'ABSPATH' ) || exit;

/**
 * Deterministically resolves which template applies to a request.
 *
 * Given the templates of one type (each with its normalized conditions) and a
 * {@see RequestContext}, the resolver returns the id of the most-specific
 * matching template, or null when none applies (the caller then falls back to
 * the theme).
 *
 * ## Specificity contract (task 006 depends on this order)
 *
 * Higher score wins:
 *   - specific content (`singular`)      — 40
 *   - taxonomy (`taxonomy`)              — 30
 *   - post type / archive (`post_type`,`archive`) — 20
 *   - entire site (`entire_site`)        — 10
 *
 * A template's score is its highest-scoring matching **include** rule. If any
 * **exclude** rule matches the request, the template is removed from
 * consideration regardless of its include rules. On a score tie, the
 * higher-id (most recently created) template wins, so resolution is stable.
 *
 * @phpstan-import-type ConditionRule from TemplateModel
 */
final class AssignmentResolver {

	private const SCORE_SINGULAR    = 40;
	private const SCORE_TAXONOMY    = 30;
	private const SCORE_POST_TYPE   = 20;
	private const SCORE_ENTIRE_SITE = 10;

	/**
	 * Resolve the winning template id for a request.
	 *
	 * @param RequestContext                  $context   The request being matched.
	 * @param array<int, list<ConditionRule>> $templates Map of template id => conditions.
	 * @return int|null Winning template id, or null when none applies.
	 */
	public function resolve( RequestContext $context, array $templates ): ?int {
		$best_id    = null;
		$best_score = -1;

		foreach ( $templates as $id => $conditions ) {
			$score = $this->score_template( $context, $conditions );
			if ( null === $score ) {
				continue;
			}
			if ( $score > $best_score || ( $score === $best_score && ( null === $best_id || $id > $best_id ) ) ) {
				$best_score = $score;
				$best_id    = $id;
			}
		}

		return $best_id;
	}

	/**
	 * Score a single template's conditions against the request.
	 *
	 * @param RequestContext            $context    Request being matched.
	 * @param array<int, ConditionRule> $conditions Template conditions.
	 * @return int|null Best include score, or null when excluded / no include matches.
	 */
	private function score_template( RequestContext $context, array $conditions ): ?int {
		$best_include = null;

		foreach ( $conditions as $rule ) {
			if ( ! $this->rule_matches( $context, $rule ) ) {
				continue;
			}
			if ( TemplateModel::BEHAVIOR_EXCLUDE === $rule['behavior'] ) {
				return null;
			}
			$score = $this->specificity( $rule['object'] );
			if ( null === $best_include || $score > $best_include ) {
				$best_include = $score;
			}
		}

		return $best_include;
	}

	/**
	 * Whether a single rule matches the request context.
	 *
	 * @param RequestContext                                         $context Request being matched.
	 * @param array{behavior: string, object: string, value: string} $rule    Condition rule.
	 */
	private function rule_matches( RequestContext $context, array $rule ): bool {
		$value = $rule['value'];

		switch ( $rule['object'] ) {
			case TemplateModel::OBJECT_ENTIRE_SITE:
				return true;

			case TemplateModel::OBJECT_SINGULAR:
				return $context->is_singular && $context->post_id === (int) $value;

			case TemplateModel::OBJECT_POST_TYPE:
				return ( $context->is_singular || $context->is_archive ) && $context->post_type === $value;

			case TemplateModel::OBJECT_TAXONOMY:
				return in_array( $value, $context->term_refs, true );

			case TemplateModel::OBJECT_ARCHIVE:
				return $context->is_archive && ( '' === $value || $context->post_type === $value );

			default:
				return false;
		}
	}

	/**
	 * Specificity score for a condition object.
	 *
	 * @param string $object_type Condition object type.
	 */
	private function specificity( string $object_type ): int {
		return match ( $object_type ) {
			TemplateModel::OBJECT_SINGULAR => self::SCORE_SINGULAR,
			TemplateModel::OBJECT_TAXONOMY => self::SCORE_TAXONOMY,
			TemplateModel::OBJECT_POST_TYPE, TemplateModel::OBJECT_ARCHIVE => self::SCORE_POST_TYPE,
			default => self::SCORE_ENTIRE_SITE,
		};
	}
}
