import { ContestController } from "./contest.controller";
import { ContestService } from "./contest.service";
import { ProblemService } from "../problem/problem.service";
import { describe } from "node:test";

import { ProblemEntity } from "src/entity/problem";
import { SubmissionEntity } from "src/entity/submission";
import { ContestEntity } from "src/entity/contest";
import { submission_verdicts } from "@paralab/proto";
import { UserEntity } from "src/entity/user";

import env from '../../envs';
import { DataSource } from 'typeorm';
import { types as pg_types } from 'pg';

describe('calculateContestRanklist', () => {
	let contestController: ContestController;
	let contestService: ContestService;
	let problemService: ProblemService;

	let defaultUserEntity: UserEntity;
	let defaultProblemEntity: ProblemEntity;
	let defaultSubmissionEntity: SubmissionEntity;

	beforeEach(async () => {
		contestService = new ContestService();
		problemService = new ProblemService();
		contestController = new ContestController(contestService, problemService);
		
		const AppDataSource: DataSource = new DataSource({
			type: 'postgres',
			host: env.POSTGRES_HOST,
			port: env.POSTGRES_PORT,
			username: env.POSTGRES_USER,
			password: env.POSTGRES_PASSWORD,
			database: env.POSTGRES_DB,
			synchronize: env.POSTGRES_SYNCHRONIZE,
			entities: [UserEntity, ProblemEntity, ContestEntity, SubmissionEntity]
		});
		pg_types.setTypeParser(pg_types.builtins.INT8, function(val) {
			return Number(val)
		});
	
		await AppDataSource.initialize()

		defaultUserEntity = UserEntity.create({
			id: 1,
			name: 'user1',
			registerTime: 1000,
			password: '',
			roleMask: 0,
			metadata: {
				motto: '',
				email: ''
			},
			submissions: []
		});
	
		defaultProblemEntity = ProblemEntity.create({
			id: 1,
			name: 'problem1',
			isPublic: true,
			allowSubmitFromProblemList: true,
			metadata: {
				description: '',
				judgeConfig: undefined
			},
			submissions: []
		});
	
		defaultSubmissionEntity = SubmissionEntity.create({
			id: 1,
			user: defaultUserEntity,
			problem: defaultProblemEntity,
			contest: undefined,
			submitTime: 100,
			verdict: "running",
			score: 100,
			judgeResult: undefined
		});
	});

	describe('calculateContestRanklist', () => {
		it('should return an empty ranklist', () => {
			const ranklist = contestService.calculateContestRanklist(
				[],
				[],
				{}
			);
			expect(ranklist).toEqual({
				players: [],
			});
		});
		it('should return the correct ranklist when there is invalid problem', () => {
			const ranklist = contestService.calculateContestRanklist(
				[undefined, undefined, undefined],
				[SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 100,
				})],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
					{
						userId: 1,
						username: 'user1',
						score: 0,
						details: [{
							score: undefined,
							submitTime: undefined,
						}, {
							score: undefined,
							submitTime: undefined,
						}, {
							score: undefined,
							submitTime: undefined,
						}],
					}
				],
			});
		});
		it('should return the correct ranklist when there is one submission', () => {
			const ranklist = contestService.calculateContestRanklist(
				[defaultProblemEntity],
				[SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 100,
				})],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
					{
						userId: 1,
						username: 'user1',
						score: 100,
						details: [{
							score: 100,
							submitTime: 100,
						}],
					}
				],
			});
		});
		it('should return the correct ranklist when the user has no submission', () => {
			const ranklist = contestService.calculateContestRanklist(
				[defaultProblemEntity],
				[],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
				],
			});
		});
		it('should return the correct ranklist when the user has no submission on some problems', () => {
			const ranklist = contestService.calculateContestRanklist(
				[
					ProblemEntity.create({
						...defaultProblemEntity,
						id: 1
					}),
					ProblemEntity.create({
						...defaultProblemEntity,
						id: 2
					})
				],
				[
					SubmissionEntity.create({
						score: 100,
						... defaultSubmissionEntity
					}),
				],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
					{
						userId: 1,
						username: 'user1',
						score: 100,
						details: [{
							score: 100,
							submitTime: 100,
						}, {
							score: undefined,
							submitTime: undefined,
						}],
					}
				],
			});
		});
		it('should return the correct ranklist when there are multiple submissions (score differs)', () => {
			const ranklist = contestService.calculateContestRanklist(
				[defaultProblemEntity],
				[SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 100,
				}), SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 50,
				})],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
					{
						userId: 1,
						username: 'user1',
						score: 100,
						details: [{
							score: 100,
							submitTime: 100,
						}],
					}
				],
			});
		});
		it('should return the correct ranklist when there are multiple submissions (submitTime differs)', () => {
			const ranklist = contestService.calculateContestRanklist(
				[defaultProblemEntity],
				[SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 100,
					submitTime: 100,
				}), SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 100,
					submitTime: 200,
				})],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
					{
						userId: 1,
						username: 'user1',
						score: 100,
						details: [{
							score: 100,
							submitTime: 100,
						}],
					}
				],
			});
		});
		it('should return the correct ranklist when there are multiple submissions (score and submitTime differs)', () => {
			const ranklist = contestService.calculateContestRanklist(
				[defaultProblemEntity],
				[SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 100,
					submitTime: 100,
				}), SubmissionEntity.create({
					... defaultSubmissionEntity,
					score: 50,
					submitTime: 200,
				})],
				{
					1: 'user1',
				}
			);
			expect(ranklist).toEqual({
				players: [
					{
						userId: 1,
						username: 'user1',
						score: 100,
						details: [{
							score: 100,
							submitTime: 100,
						}],
					}
				],
			});
		});
	});
});